const prng = require('./prng')

let spritesheets = {}
let context = null

module.exports = {
  get spritesheets () { return spritesheets },
  set spritesheets (_spritesheets) { spritesheets = _spritesheets },

  get context () { return context },
  set context (_context) { context = _context },

  draw: (spriteName, [x, y, scale = 1], { spriteIndex, drawBoundingBox = false } = {}) => {
    if (!context) throw new Error('wipmap-render/sprites must have a drawing context registerd')

    const spritesheet = spritesheets[spriteName]
    if (!spritesheet) return

    // NOTE: if the spritesheet's sprite index is undefined, randomly select a sprite in the spritesheet
    spriteIndex = spriteIndex === undefined
      ? Math.floor(prng.randomInt(0, spritesheet.length || 0))
      : spriteIndex % spritesheet.length

    // NOTE: spritesheet with no resolution are just plain image, so using width/height instead of resolution
    const [spriteWidth, spriteHeight] = spritesheet.resolution
      ? new Array(2).fill(spritesheet.resolution)
      : [spritesheet.width, spritesheet.height]

    const i = spriteIndex * spriteWidth
    const sx = i % spritesheet.width
    const sy = ((i - sx) / spritesheet.width) * spriteHeight
    const sw = spriteWidth
    const sh = spriteHeight
    const dx = Math.floor(x - (spriteWidth * scale) / 2)
    // NOTE: drawing the spritesheet from the bottom of its hitbox
    const dy = Math.floor(y - (spriteHeight * scale))
    const dw = Math.floor(spriteWidth * scale)
    const dh = Math.floor(spriteHeight * scale)

    context.drawImage(spritesheet, sx, sy, sw, sh, dx, dy, dw, dh)
    if (drawBoundingBox) context.strokeRect(dx, dy, dw, dh)
  }
}
