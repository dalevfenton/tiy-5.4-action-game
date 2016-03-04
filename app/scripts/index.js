var $ = require('jquery');
window._ = require('underscore');
var Handlebars = require('handlebars');
var id = 1;
var missileArr = [];
//-----------------------------------------------------------------------------
//                        TEMPLATES
//to include an external handlebars template named header.handlebars
//just do a var header = require("./header.handlebars") assuming it is in
//the scripts folder
//-----------------------------------------------------------------------------
var statbar = require('../templates/statbar.handlebars');
var moveScale = 30;
var missileSpeed = 50;
var boardOffset = $('#game-field').offset();
var boardWidth = $('#game-field').outerWidth();
var boardHeight = $('#game-field').outerHeight();
var boardTop = boardOffset.top;
var boardLeft = boardOffset.left;
var boardBottom = boardTop + boardHeight;
var boardRight = boardLeft + boardWidth;
console.log($('#game-field'));
console.log(boardTop, boardBottom, boardLeft, boardRight);
var windowPadding = 50;
function Target(){
  this.id = id;
  id += 1;
  this.x = _.random(boardLeft+windowPadding, boardRight-windowPadding);
  this.y = _.random(boardTop+windowPadding, boardBottom-windowPadding);
  this.draw = function(){
      $('#game-field').append('<div id="target-' + this.id + '" class="target">');
      $("#target-" + this.id).offset({top: this.y, left: this.x});
  };
}
var interval = window.setInterval(moveMissile, 33);
function pyTheorum(){

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
      console.log('removed target #' + target.id);
      $('#target-' + target.id).remove();
      return true;
    }else{
      return false;
    }
  });
}
function moveMissile(){
  console.log('called move missile');
  console.log(missileArr);
  missileArr.forEach(function(item, index){
    item.move();
    if(collide(item) || !inWindow(item) ){
      missileArr.splice( index, 1);
      console.log('removed missile #' + item.id);
      $('#missile-' + item.id).remove();
    }
  });
}
var characters = require('./characters');
function Missile(config){
  this.id = id;
  id += 1;
  this.x = (config.x || 0);
  this.y = (config.y || 0);
  this.vector = (config.vector || [1,1]);
  this.move = function(){
    console.log(this.vector);
    console.log(this.x);
    console.log(this.y);
    this.x += this.vector[0] * missileSpeed;
    this.y += this.vector[1] * missileSpeed;
    $('#missile-'+this.id).offset({ top: this.y, left: this.x });
  };
  this.draw = function(){
    $('#game-field').append('<div id="missile-' + this.id + '" class="missile">');
    $("#missile-" + this.id).offset({top: this.y, left: this.x});
  };
}
function Character(config){
  this.ID = id;
  this.damageLow = (config.low || _.random(1,6));
  this.damageHigh = (config.high || _.random(6,11));
  this.healthPoints = (config.hp || _.random(50,61));
  this.curHP = this.healthPoints;
  this.level = (config.level || _.random(1,3));
  this.nextlevel = this.level * 19;
  this.xp = (config.xp || 0);
  this.reaction = (config.react || undefined);
  this.takeDamage = function(damage){
    this.curHP -= damage;
  };
  this.rollDamage = function(){
    return _.random(this.damageLow, this.damageHigh);
  };
  id += 1;
}

// var archer = new Character(characters.archer);
// var User = new Character(characters.user);
// var Enemy;
var player = $('#player');


$(window).on('keydown', function(){
  $('#player').trigger('tbg:player');
});
$(window).on('click', function(){
  $(window).trigger('tbg:player-attack');
  // console.log(event);
});


$(window).bind('tbg:player-attack', fireMissile );

function fireMissile(){
  event.preventDefault();
  var mouseAbsPosX = event.x;
  var mouseAbsPosY = event.y;
  var playerAbsPos = player.offset();
  var vector = [ mouseAbsPosX - playerAbsPos.left, mouseAbsPosY - playerAbsPos.top ];
  var vectorDist = Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
  vector = [ vector[0]/ vectorDist, vector[1]/vectorDist];
  var missile = new Missile({x: playerAbsPos.left, y:playerAbsPos.top, vector:vector});
  console.log(missile);
  missile.draw();
  missileArr.push(missile);
  console.log('missile fired');
  console.log(event);
}

$('#player').bind('tbg:player', playerAction );

function playerAction(){
  console.log('player moves');
  var offset = player.offset();
  switch (event.which) {
    case 37 || 65:
        // Key left.
        move(offset, 0, -1);
        break;
    case 38 || 87:
        // Key up.
        move(offset, -1, 0);
        break;
    case 39 || 68:
        // Key right.
        move(offset, 0, 1);
        break;
    case 40 || 83:
        // Key down.
        move(offset, 1, 0);
        break;
    case 32:
        // spacebar == attack
        playerAttack();
        break;
  }
  // console.log(event);
}

function move(offset, x, y){
  player.offset({ top: offset.top + (x * moveScale), left: offset.left + (y * moveScale) });
}

// function init(){
//   Enemy = new Character(characters.enemy);
//   User.curHP = User.healthPoints;
//   checkXP();
//   $('#user-display').bind('tbg:user-attack', userTurn );
//   $('#user-display').find('.stat-holder').html(statbar(User));
//   $('#opponent-display').find('.stat-holder').html(statbar(Enemy));
//   $('.log').html('');
// }
// function checkXP(){
//   if(User.xp > (User.level*19)){
//     levelUp();
//   }
// }
// function levelUp(){
//   User.damageLow += 1;
//   User.damageHigh += 2;
//   User.healthPoints += 10;
//   User.level += 1;
//   User.nextlevel = User.level * 19;
//   alert('you have leveled up and gotten stronger!');
// }
//
// function rollDamage(lo, hi){
//   return _.random(lo, hi);
// }
// function dealDamage( Char, damage ){
//   Char.curHP -= damage;
// }
// function checkWin(){
//     if( User.curHP <= 0){
//       alert( 'you lose and your character loses 10xp :(');
//       User.xp -= 10;
//       init();
//       return true;
//     }
//     if( Enemy.curHP <= 0){
//       alert( 'you win and gain ' + Enemy.xp + 'xp!');
//       User.xp += Enemy.xp;
//       init();
//       return true;
//     }
//     return false;
// }
//
//
// function enemyTurn(event){
//   $('#user-display').bind('tbg:user-attack', userTurn );
//   var damage = Enemy.rollDamage();
//   User.takeDamage(damage);
//   $('#opponent-display').find('.log').append('Enemy Attacked Your For ' + damage + '<br>');
//   $('#user-display').find('.stat-holder').html(statbar(User));
//   if( !checkWin() ){
//     $('#opponent-display').find('.alert').html('Enemy Attacked!');
//     $('#user-display .alert').html('Click to Attack...');
//   }
// }
//
// function userTurn(event){
//   $(this).unbind("tbg:user-attack");
//   var damage = User.rollDamage();
//   Enemy.takeDamage(damage);
//   $(this).find('.log').append('You Attacked For ' + damage + '<br>');
//   $('#opponent-display').find('.stat-holder').html(statbar(Enemy));
//   $(this).find('.alert').html('You Attacked!');
//   if( !checkWin() ){
//     $('#opponent-display .alert').html('attacking you...');
//     window.setTimeout( enemyTurn, 500 );
//   }
// }

// init();
