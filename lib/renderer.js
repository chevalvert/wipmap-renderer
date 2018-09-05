const { map } = require('missing-math')
const prng = require('./utils/prng')
const spritesDrawer = require('./utils/sprites')

const SPRITETYPE = {
  biomeTexture: Symbol('the sprite is used as biome texture'),
  landmark: Symbol('the sprite is used as a landmark symbol')
}

const DEFAULT_RENDER_OPTIONS = {
  renderBiomesTexture: true,
  renderLandmarks: true,
  renderPoisson: false,
  renderVoronoiCells: false,
  renderVoronoiSites: false,
  fillVoronoiCells: false,
  background: 'white',
  scale: 1,
  smooth: false,
  forceUpdate: false,
  drawBoundingBox: false,
  debugPerf: false,
  colorMap: {
    'TAIGA': '#66CCFF',
    'JUNGLE': '#FF8000',
    'SWAMP': '#3C421E',
    'TUNDRA': '#800000',
    'PLAINS': '#80FF00',
    'FOREST': '#008040',
    'DESERT': 'yellow',
    'WATER': 'blue'
  }
}

module.exports = class Renderer {
  constructor (canvas, {
    map = undefined,
    textures = {},
    spritesheets = {},
    seed = Math.random()
  } = {}) {
    if (!canvas || !canvas.getContext) throw new Error('wipmap-renderer must be linked to a canvas')

    this.canvas = canvas
    this.context = canvas.getContext('2d')

    this.map = map
    this.seed = seed

    prng.seed = this.seed
    spritesDrawer.context = this.context
    spritesDrawer.spritesheets = spritesheets

    this.textures = textures
  }

  get width () { return this.canvas.width }
  get height () { return this.canvas.height }

  update (landmarks, opts = {}) {
    opts = Object.assign({}, DEFAULT_RENDER_OPTIONS, opts)
    if (opts.debugPerf) console.time('total render duration')

    prng.reset()

    this.cachedSprites = (!this.cachedSprites || opts.forceUpdate)
      ? this.processBiomesTextureSprites()
      : this.cachedSprites

    // NOTE: landmark sprites aren't cached
    const queuedSprites = [...this.cachedSprites]
    this.processLandmarksSprites(queuedSprites, landmarks)

    // NOTE: sort sprites stack by Y coordinate to simulate Z depth
    queuedSprites.sort((a, b) => a.y - b.y)

    this.render(queuedSprites, opts)
    if (opts.debugPerf) console.timeEnd('total render duration')
  }

  processLandmarksSprites (renderQueue = [], landmarks = []) {
    landmarks.forEach(landmark => {
      const [x, y] = this.toWorld(landmark.position)
      landmark.points.forEach(([offx, offy]) => {
        renderQueue.push({
          type: SPRITETYPE.landmark,
          name: landmark.sprite.name,
          x: x + offx,
          y: y + offy + landmark.sprite.spritesheet.resolution / 2,
          spriteIndex: landmark.sprite.index
        })
      })
    })
    return renderQueue
  }

  processBiomesTextureSprites (renderQueue = []) {
    Object.entries(this.map.points).forEach(([type, points]) => {
      const sprites = this.textures[type]
      if (!this.textures[type]) return

      points.forEach(point => {
        const [x, y] = this.toWorld(point)
        sprites.forEach(([name, probability, scale]) => {
          if (prng.random() < probability) {
            renderQueue.push({
              type: SPRITETYPE.biomeTexture,
              name,
              x,
              y,
              scale,
              spriteIndex: prng.randomInt(0, 100)
            })
          }
        })
      })
    })
    return renderQueue
  }

  render (queue, opts) {
    this.clear(opts.background)
    this.context.imageSmoothingEnabled = opts.smooth

    if (opts.renderVoronoiCells) this.renderVoronoiCells(opts)
    if (opts.renderPoisson) this.renderPoisson(opts)

    this.renderSprites(queue, opts)

    if (opts.renderVoronoiSites) this.renderVoronoiSites(opts)
  }

  renderSprites (sprites, opts) {
    sprites.forEach(({ name, x, y, scale, spriteIndex, type }) => {
      if (!opts.renderBiomesTexture && type === SPRITETYPE.biomeTexture) return
      if (!opts.renderLandmarks && type === SPRITETYPE.landmark) return

      spritesDrawer.draw(name, [x, y, scale || opts.scale], {
        spriteIndex,
        drawBoundingBox: opts.drawBoundingBox
      })
    })
  }

  renderVoronoiCells (opts) {
    this.context.save()

    this.context.strokeStyle = 'red'
    this.map.biomes.forEach(({ cell, type }) => {
      this.context.fillStyle = opts.colorMap[type]
      this.context.beginPath()
      cell.forEach((point, index) => {
        const [x, y] = this.toWorld(point)
        if (index === 0) this.context.moveTo(x, y)
        else this.context.lineTo(x, y)
      })
      opts.fillVoronoiCells && this.context.closePath()
      opts.fillVoronoiCells && this.context.fill()
      this.context.stroke()
    })

    this.context.restore()
  }

  renderVoronoiSites (opts) {
    this.context.save()

    this.map.biomes.forEach(({ site, type }) => {
      this.context.fillStyle = opts.colorMap[type]

      const [x, y] = this.toWorld(site)
      this.context.fillRect(x - 10, y - 10, 20, 20)
    })

    this.context.restore()
  }

  renderPoisson (opts) {
    Object.entries(this.map.points).forEach(([type, points]) => {
      this.context.save()
      this.context.fillStyle = opts.colorMap[type]
      points.forEach(point => {
        const [x, y] = this.toWorld(point)
        this.context.fillRect(x - 2, y - 2, 4, 4)
      })
      this.context.restore()
    })
  }

  clear (background) {
    this.context.clearRect(0, 0, this.width, this.height)

    if (!background) return
    this.context.save()
    this.context.fillStyle = background
    this.context.fillRect(0, 0, this.width, this.height)
    this.context.restore()
  }

  toWorld ([x, y]) {
    return [
      map(x, 0, this.map.width, 0, this.width),
      map(y, 0, this.map.height, 0, this.height)
    ]
  }

  toDataURL (format = 'image/png') {
    return this.canvas.toDataURL(format)
  }

  toBlob (callback) {
    return this.canvas.toBlob(callback)
  }
}
