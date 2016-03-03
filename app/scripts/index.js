var $ = require('jquery');
window._ = require('underscore');
var Handlebars = require('handlebars');

var statbar = require('../templates/statbar.handlebars');



//id is used to set unique identifiers on each object created so that we
//can set a unique id on the HTML elements and select them to move or remove
var id = 1;

//-----------------------------------------------------------------------------
//                        TEMPLATES
//to include an external handlebars template named header.handlebars
//just do a var header = require("./header.handlebars") assuming it is in
//the scripts folder
//-----------------------------------------------------------------------------
var statbar = require('../templates/statbar.handlebars');
var characters = require('./characters');
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

var User = new Character(characters.user);
var Enemy;


// $(window).on('keydown', function(){
//   $('#player').trigger('tbg:player');
// });
$(window).on('click', function(){
  $(window).trigger('tbg:player-attack');
  // console.log(event);
});


// $(window).bind('tbg:player-attack', fireMissile );



function init(){
  Enemy = new Character(characters.enemy);
  User.curHP = User.healthPoints;
  checkXP();
  $('#user-display').bind('tbg:user-attack', userTurn );
  $('#user-display').find('.stat-holder').html(statbar(User));
  $('#opponent-display').find('.stat-holder').html(statbar(Enemy));
  $('.log').html('');
}
function checkXP(){
  if(User.xp > (User.level*19)){
    levelUp();
  }
}
function levelUp(){
  User.damageLow += 1;
  User.damageHigh += 2;
  User.healthPoints += 10;
  User.level += 1;
  User.nextlevel = User.level * 19;
  alert('you have leveled up and gotten stronger!');
}

function rollDamage(lo, hi){
  return _.random(lo, hi);
}
function dealDamage( Char, damage ){
  Char.curHP -= damage;
}
function checkWin(){
    if( User.curHP <= 0){
      alert( 'you lose and your character loses 10xp :(');
      User.xp -= 10;
      init();
      return true;
    }
    if( Enemy.curHP <= 0){
      alert( 'you win and gain ' + Enemy.xp + 'xp!');
      User.xp += Enemy.xp;
      init();
      return true;
    }
    return false;
}


function enemyTurn(event){
  $('#user-display').bind('tbg:user-attack', userTurn );
  var damage = Enemy.rollDamage();
  User.takeDamage(damage);
  $('#opponent-display').find('.log').append('Enemy Attacked Your For ' + damage + '<br>');
  $('#user-display').find('.stat-holder').html(statbar(User));
  if( !checkWin() ){
    $('#opponent-display').find('.alert').html('Enemy Attacked!');
    $('#user-display .alert').html('Click to Attack...');
  }
}

function userTurn(event){
  $(this).unbind("tbg:user-attack");
  var damage = User.rollDamage();
  Enemy.takeDamage(damage);
  $(this).find('.log').append('You Attacked For ' + damage + '<br>');
  $('#opponent-display').find('.stat-holder').html(statbar(Enemy));
  $(this).find('.alert').html('You Attacked!');
  if( !checkWin() ){
    $('#opponent-display .alert').html('attacking you...');
    window.setTimeout( enemyTurn, 500 );
  }
}

init();
