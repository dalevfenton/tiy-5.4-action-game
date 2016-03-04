//features to add
//upgrades with levelups
//set missiles to non-penetrating
//upgrades weapon (flamethrower, aoe on impact, spread, multi shot)
//sprites for character and enemies
//harder enemies as levelup
//start & pause menu
//gradual start with loading of enemies
//save game / high scores
//multiplayer

var $ = require('jquery');
window._ = require('underscore');
var Handlebars = require('handlebars');

var statbar = require('../templates/statbar.handlebars');



//id is used to set unique identifiers on each object created so that we
//can set a unique id on the HTML elements and select them to move or remove
var id = 1;

//missileArr holds a list of Missile objects and iterates over them on each
//window refresh to move them and detect collisions
var missileArr = [];
//windowpadding is used to make sure targets do not spawn too close to the edge
//of the window
var windowPadding = 50;

//setup bounds of the game field so we can tell if missiles or characters have
//gone offscreen and remove them from our tracking
var boardOffset = $('#game-field').offset();
var boardWidth = $('#game-field').outerWidth();
var boardHeight = $('#game-field').outerHeight();
var boardTop = boardOffset.top;
var boardLeft = boardOffset.left;
var boardBottom = boardTop + boardHeight;
var boardRight = boardLeft + boardWidth;
var screenRefresh = 33;

$('#test-obj-top').offset({top: boardTop, left: boardRight});
$('#test-obj-bottom').offset({top: boardBottom, left: boardRight});

function Missile(config){
  this.id = id;
  id += 1;
  this.x = (config.x || 0);
  this.y = (config.y || 0);
  this.speed = (config.speed || 50);
  this.vector = (config.vector || [1,1]);
  this.move = function(){
    this.x += this.vector[0] * this.speed;
    this.y += this.vector[1] * this.speed;
    $('#missile-'+this.id).offset({ top: this.y, left: this.x });
  };
  this.draw = function(){
    $('#game-field').append('<div id="missile-' + this.id + '" class="missile">');
    $("#missile-" + this.id).offset({top: this.y, left: this.x});
  };
}

function Target(config){
  this.id = id;
  this.speed = 1;
  this.xp = 10;
  this.score = 10;
  id += 1;
  this.x = _.random(boardLeft+windowPadding, boardRight-windowPadding);
  this.y = _.random(boardTop+windowPadding, boardBottom-windowPadding);
  this.draw = function(){
    $('#game-field').append('<div id="target-' + this.id + '" class="target">');
    $("#target-" + this.id).offset({top: this.y, left: this.x});
  };
  this.move = function(){
    var vector = normalizedVector(player.x, player.y, this.x, this.y);
    this.x += vector[0] * this.speed;
    this.y += vector[1] * this.speed;
    $("#target-" + this.id).offset({top: this.y, left: this.x});
  };
}

function calcLevel(level){
  return (25 * level * ( 1 + level ));
}
var player = {
  x: $('#player').offset().left,
  y: $('#player').offset().top,
  selector: '#player',
  speed: 30,
  xp: 0,
  level: 1,
  nextLevel: calcLevel(1),
  score: 0,
  timeSinceKill: 0,
  comboKills: 0,
  move: function(vector){
    this.x += vector[0] * this.speed;
    this.y += vector[1] * this.speed;
    if(this.x < boardLeft){
      this.x = boardLeft;
    }
    if(this.x > boardRight){
      this.x = boardRight;
    }
    if(this.y < boardTop){
      this.y = boardTop;
    }
    if(this.y > boardBottom){
      this.y = boardBottom;
    }
    $(this.selector).offset({top: this.y, left: this.x});
  },
  killedTarget: function(target){
    this.xp += target.xp;
    this.comboKills += 1;
    this.score += (target.score * this.comboKills);
    this.timeSinceKill = 0;
    this.checkLevel();
  },
  checkCombo: function(){
    if(this.timeSinceKill > 5000 ){
      this.comboKills = 0;
    }
  },
  addTime: function(){
    this.timeSinceKill += screenRefresh;
  },
  checkLevel: function(){
    if(this.xp > this.nextLevel){
      this.levelUp();
      console.log(this.level);
      this.nextLevel = calcLevel(this.level);
    }
  },
  levelUp: function(){
    this.speed += 1;
    this.level += 1;
  }
};
// player.offset({ top: offset.top + (x * moveScale), left: offset.left + (y * moveScale) });

$(window).on('keydown', function(){
  $('#player').trigger('tbg:player');
});
$(window).on('click', function(){
  $(window).trigger('tbg:player-attack');
  // console.log(event);
});

//this setInterval function updates our game window at approx 30fps
var interval = window.setInterval(refreshWindow, screenRefresh);

function refreshWindow(){
  moveTargets();
  moveMissiles();
  while(targetArr.length < 10){
    var target = new Target();
    target.draw();
    targetArr.push(target);
  }
  player.addTime();
  player.checkCombo();
  $('#user-display').find('.stat-holder').html(statbar(player));
}
//pythagorean theorum function to calculate distance between two objects
//(mainly used to try and detect collisions)
function pyTheorum(x1, y1, x2, y2){
 return Math.abs(Math.sqrt( Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
}
function normalizedVector(x1, y1, x2, y2){
  var rawVect = [ x1-x2, y1-y2];
  var dist = pyTheorum(x1, y1, x2, y2);
  return [ rawVect[0] / dist, rawVect[1] / dist ];
}

var targetArr = [];
for(var i = 0; i < 10; i++){
  var target = new Target();
  target.draw();
  targetArr.push(target);
}
console.log(targetArr);
function inWindow( sprite ){
  if( boardLeft < sprite.x && sprite.x < boardRight && boardTop < sprite.y && sprite.y < boardBottom ){
    return true;
  }else{
    return false;
  }
}
function collide( sprite ){
  targetArr.forEach(function(target, index){
    var dist = Math.sqrt( Math.pow((sprite.x - target.x), 2) + Math.pow((sprite.y - target.y), 2));
    if(dist < 30){
      targetArr.splice( index, 1);
      $('#target-' + target.id).remove();
      player.killedTarget(target);
      return true;
    }else{
      return false;
    }
  });
}
function moveTargets(){
  targetArr.forEach(function(item, index){
    item.move();
    // if(collide(item) || !inWindow(item) ){
    //   targetArr.splice( index, 1);
    //   console.log('removed target #' + item.id);
    //   $('#target-' + item.id).remove();
    // }
  });
}
function moveMissiles(){
  missileArr.forEach(function(item, index){
    item.move();
    if(collide(item) || !inWindow(item) ){
      missileArr.splice( index, 1);
      $('#missile-' + item.id).remove();
    }
  });
}





$(window).bind('tbg:player-attack', fireMissile );

function fireMissile(){
  event.preventDefault();
  var mouseAbsPosX = event.x;
  var mouseAbsPosY = event.y;
  var vector = normalizedVector(event.x, event.y, player.x, player.y );
  var missile = new Missile({x: player.x, y: player.y, vector:vector});
  missile.draw();
  missileArr.push(missile);
}

$('#player').bind('tbg:player', playerAction );

function playerAction(){
  switch (event.which) {
    case 37 || 65:
        // Key left.
        player.move([-1, 0]);
        break;
    case 38 || 87:
        // Key up.
        player.move([0, -1]);
        break;
    case 39 || 68:
        // Key right.
        player.move([1, 0]);
        break;
    case 40 || 83:
        // Key down.
        player.move([0, 1]);
        break;
    case 32:
        // spacebar == attack
        playerAttack();
        break;
  }
}
