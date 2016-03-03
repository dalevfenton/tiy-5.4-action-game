module.exports = {
  user: {
    low: _.random(3,5),
    high: _.random(8,10),
    hp: _.random(50,60),
    level: 1,
    xp: 0,
    react: 'friendly'
  },
  enemy: {
    low: _.random(1,5),
    high: _.random(5,10),
    hp: _.random(20,30),
    level: 1,
    xp: 10
  },
  archer: {
    low: _.random(1,3),
    high: _.random(4,15),
    hp: _.random(10,20),
    level: 1,
    xp: 8
  }
};
