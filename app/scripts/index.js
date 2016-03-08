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


//--------------------------3rd Party Libraries---------------------------------
var $ = require('jquery');
window._ = require('underscore');
var Handlebars = require('handlebars');
var statbar = require('../templates/statbar.handlebars');
var gameinfo = require('../templates/gameinfo.handlebars');

//----------------------------GLOBAL VARIABLES ---------------------------------
//id is used to set unique identifiers on each object created so that we
//can set a unique id on the HTML elements and select them to move or remove
var id = 1;
//duration is used to track overall amount of time and spawn enemies
var duration = 0;
//missileArr holds a list of Missile objects and iterates over them on each
//window refresh to move them and detect collisions
var missileArr = [];
//targetArr holds our list of enemies and iterates over them on each
//window refresh as well
var targetArr = [];
//interval is the ID passed when we call setInterval so that we can clearInterval
//if the game is paused
var interval;
//windowpadding and playerpadding is used to make sure targets do not
//spawn too close to the edge of the window or the player
var windowPadding = 50;
var playerPadding = 50;
//variables used to set game board bounds declared into global scope
var boardOffset, boardWidth, boardHeight, boardTop, boardLeft, boardBottom, boardRight;
//screen refresh is the miliseconds between calls of our screenRefresh function
//33 comes out to around 30fps
var screenRefresh = 33;
//player is instantiated with the player constructor but we want it available for
//all our functions (at this the way it's implemented)
var player;


//------------------------------------------------------------------------------
//                               CONSTRUCTORS
//------------------------------------------------------------------------------
//Missile is the constructor for elements fired by the user at Targets
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
  this.remove = function( index ){
    missileArr.splice( index, 1);
    $('#missile-' + this.id).remove();
  };
}
//Target is the constructor for enemy elements that are trying to kill the player
function Target(config){
  this.id = id;
  id += 1;
  this.speed = (config.speed || 1.5);
  this.xp = (config.xp || 10);
  this.score = (config.score || 10);
  this.size = (config.size || 30);
  this.selector = ( config.selector || 'target');
  this.x = _.random(boardLeft+windowPadding, boardRight-windowPadding);
  this.y = _.random(boardTop+windowPadding, boardBottom-windowPadding);
  this.setStart = function(){
    var start = _.random(0,4);
    switch (start) {
      case 0:
        //start outside of top edge
        this.y = boardTop - windowPadding;
        this.x = _.random(boardLeft - windowPadding, boardRight + windowPadding);
        break;
      case 1:
        //start outside of right edge
        this.y = _.random(boardTop - windowPadding, boardBottom + windowPadding);
        this.x = boardRight + windowPadding;
        break;
      case 2:
        //start outside of bottom edge
        this.y = boardBottom + windowPadding;
        this.x = _.random(boardLeft - windowPadding, boardRight + windowPadding);
        break;
      case 3:
        //start outside of left edge
        this.y = _.random(boardTop - windowPadding, boardBottom + windowPadding);
        this.x = boardLeft - windowPadding;
        break;
    }
  };
  this.draw = function(){
    this.setStart();
    $('#game-field').append('<div id="' + this.selector + '-' + this.id + '" class="' + this.selector + '">');
    $("#" + this.selector + "-" + this.id).offset({top: this.y, left: this.x});
  };
  this.move = function(){
    var vector = normalizedVector(player.x, player.y, this.x, this.y);
    this.x += vector[0] * this.speed;
    this.y += vector[1] * this.speed;
      $("#" + this.selector + "-" + this.id).offset({top: this.y, left: this.x});
  };
  this.remove = function(index){
    targetArr.splice( index, 1);
      $("#" + this.selector + "-" + this.id).remove();
  };
}
//Player is constructed and has methods to handle most player actions
function Player( config ){
  this.selector = (config.selector || '#player');
  this.x = $(this.selector).offset().left;
  this.y = $(this.selector).offset().top;
  this.vector = [0,0];
  this.speed = ( config.speed || 5);
  this.xp = ( config.xp || 0);
  this.level = ( config.level || 1);
  this.size = 20;
  this.calcLevel = function( ){
    return (25 * this.level * ( 1 + this.level ));
  };
  this.nextLevel = this.calcLevel( );
  this.score = ( config.score || 0 );
  this.timeSinceKill = 0;
  this.comboKills = 0;
  this.move = function(vector){
    this.x += this.vector[0] * this.speed;
    this.y += this.vector[1] * this.speed;
    if(this.x < boardLeft){
      this.x = boardLeft;
    }
    if(this.x > boardRight - this.size ){
      this.x =  boardRight - this.size;
    }
    if(this.y < boardTop){
      this.y = boardTop;
    }
    if(this.y > boardBottom - this.size){
      this.y = boardBottom - this.size;
    }
    $(this.selector).offset({top: this.y, left: this.x});
  };
  this.killedTarget = function(target){
    this.xp += target.xp;
    this.comboKills += 1;
    this.score += (target.score * this.comboKills);
    this.timeSinceKill = 0;
    this.checkLevel();
  };
  this.checkCombo =  function(){
    if(this.timeSinceKill > 5000 ){
      this.comboKills = 0;
    }
  };
  this.addTime =  function(){
    this.timeSinceKill += screenRefresh;
  };
  this.checkLevel =  function(){
    if(this.xp > this.nextLevel){
      this.levelUp();
      this.nextLevel = this.calcLevel();
    }
  };
  this.levelUp = function(){
    // this.speed += 1;
    this.level += 1;
  };
}


//------------------------------------------------------------------------------
//                   APPLICATION FLOW AND CONTROLLER FUNCTIONS
//------------------------------------------------------------------------------


//-------------------------------INITIALIZATION---------------------------------
//game initialization function that is called when user clicks the start game button
//sets many of our globals and event listeners, then starts a setInterval that
//runs the game loop
function initializeGame(){
  //------------------------SETUP DATA OBJECTS ---------------------------------
  player = new Player({selector: '#player'});
  targetArr = [];
  missileArr = [];
  //-------------------NAMESPACED EVENT TRIGGERS -------------------------------
  $(window).on('keydown keyup', function(){
    $(player.selector).trigger('tbg:player-move');
  });
  $(window).on('click', function(){
    $(window).trigger('tbg:player-attack');
  });
  boardOffset = $('#game-field').offset();
  boardWidth = $('#game-field').outerWidth();
  boardHeight = $('#game-field').outerHeight();
  boardTop = boardOffset.top;
  boardLeft = boardOffset.left;
  boardBottom = boardTop + boardHeight;
  boardRight = boardLeft + boardWidth;
  $(window).bind('tbg:player-attack', fireMissile );
  $(player.selector).bind('tbg:player-move', playerVector );
  loadEnemies();
  interval = window.setInterval(refreshWindow, screenRefresh);
}
//-------------------------------REFRESH WINDOW---------------------------------
//this is the callback used by setInterval to update our data and redraw the
//display at approx 30fps
function refreshWindow(){
  loadEnemies();
  moveTargets();
  moveMissiles();
  player.addTime();
  player.checkCombo();
  player.move();
  // player.move();
  $('#user-display').find('.stat-holder').html(statbar(player));
}
//-------------------------------LOAD ENEMIES-----------------------------------
function loadEnemies(){
  duration += screenRefresh;
  //approximately once every 2 seconds and with less than 15 targets on screen
  //then add a new target object and push onto the targetArr
  if(duration % (screenRefresh * 50) === 0 && targetArr.length < 15 ){
      var target = new Target({});
      target.draw();
      targetArr.push(target);
  }
}

//-------------------------------MOVE ENEMIES-----------------------------------
//move our targets and check if any of them have gotten our player, if so
//end the game
function moveTargets(){
  targetArr.forEach(function(item, index){
    item.move();
    if( collidePlayer(item, player) ){
      //trigger game over
      clearInterval(interval);
      //drawinfo should probably take an argument to display context screen
      drawInfo();
    }
  });
}
//------------------------------MOVE MISSILES-----------------------------------
function moveMissiles(){
  missileArr.forEach(function(item, index){
    item.move();
    if(collideTarget(item, targetArr) || !inWindow(item) ){
      item.remove(index);

    }
  });
}
//------------------------------------------------------------------------------
//                      UTILITY AND HELPER FUNCTIONS
//------------------------------------------------------------------------------
//pythagorean theorum function to calculate distance between two objects
//(mainly used to try and detect collisions)
function pyTheorum(x1, y1, x2, y2){
 return Math.abs(Math.sqrt( Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
}
//returns a scale normalized vector to use in translation of objects onscreen
function normalizedVector(x1, y1, x2, y2){
  var rawVect = [ x1-x2, y1-y2];
  var dist = pyTheorum(x1, y1, x2, y2);
  return [ rawVect[0] / dist, rawVect[1] / dist ];
}
//function used to detect if our missiles or other objects have gone offscreen
function inWindow( sprite ){
  if( boardLeft < sprite.x && sprite.x < boardRight && boardTop < sprite.y && sprite.y < boardBottom ){
    return true;
  }else{
    return false;
  }
}
//collision detection function that checks if the attackObj has hit the hitObj
function collideTarget( attackObj, targetObjs ){
  targetObjs.forEach(function(target, index){
    var dist = pyTheorum( target.x, target.y, attackObj.x, attackObj.y);
    if(dist < target.size){
      target.remove(index);
      player.killedTarget(target);
      return true;
    }else{
      return false;
    }
  });
}

//detect if our player has been hit, if so end the game
function collidePlayer( item, player ){
  var dist = pyTheorum(item.x, item.y, player.x, player.y);
  if(dist < player.size){
    return true;
  }else{
    return false;
  }
}

//called by mouse click handler and creates a new missile and adds it to our
//missile array
function fireMissile(){
  event.preventDefault();
  var mouseAbsPosX = event.x;
  var mouseAbsPosY = event.y;
  var vector = normalizedVector(event.x, event.y, player.x, player.y );
  var missile = new Missile({x: player.x, y: player.y, vector:vector});
  missile.draw();
  missileArr.push(missile);
}

//called by keyboard event handler and sets player motion as well as pauses game
function playerVector(){
  var movement;
  if(event.type == 'keydown'){
    movement = 1;
  }else{
    movement = 0;
  }
  switch (event.which) {
    case 37:
    case 65:
        // Key left.
        player.vector[0] = movement * -1;
        break;
    case 38:
    case 87:
        // Key up.
        player.vector[1] = movement * -1;
        break;
    case 39:
    case 68:
        // Key right.
        player.vector[0] = movement;
        break;
    case 40:
    case 83:
        // Key down.
        player.vector[1] = movement;
        break;
    case 32:
        //spacebar selector
        break;
    case 27:
        //display pause
        $('#game-info').addClass('show-info');
        clearInterval(interval);
        break;

  }
}

//------------------------------------------------------------------------------
//                         UI ELEMENT MANAGEMENT
//------------------------------------------------------------------------------
function drawInfo(){
  $('#game-field').html('<div id="player"></div>');
  $('#game-field').append(gameinfo({}));
  $('#user-display').find('.stat-holder').html(statbar(player));
  $('#game-info').addClass('show-info');
  setInfoHandlers();
}

function setInfoHandlers(){
  $('#start-btn').click(function(event){
    //initialize a game
    initializeGame();
    closeWindow();
  });
  $('#how-to-play').click(function(event){
    //run modal template to display game info
  });
  $('#load-a-game').click(function(event){
    //run ajax request to look for saved games
  });
  $('#unpause').click(function(event){
    closeWindow();
    interval = window.setInterval(refreshWindow, screenRefresh);
  });
  $('#save-a-game').click(function(event){
    //compile all our objects and send to server with game id
    //show form to get name and set hash based on some unique value
  });
}
//closes the game-info modal so we can start the game
function closeWindow(){
  $('#game-info').removeClass('show-info');
}

//draw info on initial screen
drawInfo();
