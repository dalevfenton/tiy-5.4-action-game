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
var moveScale = 10;
var missileSpeed = 20;
Handlebars.registerHelper('next-level', function( level ) {
  return new Handlebars.SafeString( level * 19 );
});
var interval = window.setInterval(moveMissile, 100);
function moveMissile(){
  console.log('called move missile');
  console.log(missileArr);
  missileArr.forEach(function(item){
    item.move();
    item.draw();
  });
}
var characters = require('./characters');
function Missile(config, id){
  this.ID = id;
  this.x = (config.x || 0);
  this.y = (config.y || 0);
  this.vector = (config.vector || [1,1]);
  this.move = function(){
    this.x += this.vector[0] * missileSpeed;
    this.y += this.vector[1] * missileSpeed;
    $('#missile-'+this.id).offset({ top: this.x, left: this.y });
  };
  this.draw = function(){
    $('#game-field').append('<div id="missile-' + this.id + '" class="missile">');
    $("#missile-" + this.id).offset({top: this.y, left: this.x});
  };
}
function Character(config, id){
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

var archer = new Character(characters.archer);
var User = new Character(characters.user);
var Enemy;
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
  var vector = [mouseAbsPosX - playerAbsPos.left, mouseAbsPosY - playerAbsPos.top];
  var vectorDist = Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
  vector = [ vector[0]/ vectorDist, vector[1]/vectorDist];
  missileArr.push(new Missile({x: playerAbsPos.left, y:playerAbsPos.top, vector:vector}, id));
  console.log(missileArr);
  id += 1;
  console.log('missile fired');
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
