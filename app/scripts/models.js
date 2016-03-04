module.exports = {
  //Missile is the base class for bullets fired by the character
  'Missile': function Missile(config){
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
  },
  //Target is the base class for a static onscreen creature
  'Target': function Target(){
    this.id = id;
    this.speed = (config.speed || 5 );
    id += 1;
    this.x = _.random(boardLeft+windowPadding, boardRight-windowPadding);
    this.y = _.random(boardTop+windowPadding, boardBottom-windowPadding);
    this.draw = function(){
      $('#game-field').append('<div id="target-' + this.id + '" class="target">');
      $("#target-" + this.id).offset({top: this.y, left: this.x});
    };
    this.move = function(){
      $("#target-" + this.id).offset({top: this.y + _.random(this.speed * -1, this.speed), left: this.x + _.random(this.speed * -1, this.speed)});
    };
  },
  //Character is the a base class for onscreen characters
  'Character': function Character(config){
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
}
