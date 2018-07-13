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

    const i = spriteIndex * spritesheet.resolution
    const sx = i % spritesheet.width
    const sy = ((i - sx) / spritesheet.width) * spritesheet.resolution
    const sw = spritesheet.resolution
    const sh = spritesheet.resolution
    const dx = Math.floor(x - (spritesheet.resolution * scale) / 2)
    // NOTE: drawing the spritesheet from the bottom of its hitbox
    const dy = Math.floor(y - (spritesheet.resolution * scale))
    const dw = Math.floor(spritesheet.resolution * scale)
    const dh = Math.floor(spritesheet.resolution * scale)

    context.drawImage(spritesheet, sx, sy, sw, sh, dx, dy, dw, dh)
    if (drawBoundingBox) context.strokeRect(dx, dy, dw, dh)
  }
}
