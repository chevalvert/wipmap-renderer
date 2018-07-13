const fastRandom = require('fast-random')

let seed = 0
let randomizer = fastRandom(seed)

module.exports = {
  get seed () { return seed },
  set seed (newSeed) {
    seed = newSeed
    randomizer = fastRandom(seed)
  },
  reset: () => { randomizer = fastRandom(seed) },
  random: () => randomizer.nextFloat(),
  randomFloat: (min, max) => randomizer.nextFloat() * (max - min) + min,
  randomInt: (min, max) => Math.floor(randomizer.nextFloat() * (max - min) + min)
}
