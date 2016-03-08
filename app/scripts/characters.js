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
  },
  enemies: {
    greenie: {
      xp: 10,
      level: 1,
      speed: 1,
      selector: 'greenie'
    },
    yellowie: {
      xp: 15,
      level: 2,
      speed: 1.25,
      selector: 'yellowie'
    },
    reddie: {
      xp: 10,
      level: 4,
      speed: 1.5,
      selector: 'reddie'
    },
    bouncer: {
      xp: 25,
      level: 4,
      speed: 3,
      selector: 'bouncer'
    },
    poisoner: {
      xp: 20,
      level: 5,
      speed: 2,
      selector: 'poisoner'
    },
    chainer: {
      xp: 30,
      level: 5,
      speed: 3,
      selector: 'chainer'
    },
    guardian: {
      xp: 40,
      level: 8,
      speed: 1.25,
      selector: 'guardian'
    },
    turrett: {
      xp: 35,
      level: 8,
      speed: 0,
      selector: 'turrett'
    },
    exploder: {
      xp: 40,
      level: 10,
      speed: 4,
      selector: 'exploder'
    }
  }
};
