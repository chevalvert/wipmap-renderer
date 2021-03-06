# wipmap-renderer [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)
> JS module to render `wipmap` maps on canvas

## Installation

```sh
yarn add chevalvert/wipmap-renderer
```

## Usage

```js
import generate from 'wipmap-generate'
import Renderer from 'wipmap-renderer'

const map = generate(0, 0)
const renderer = new Renderer(document.getElementById('canvas'), {
  map,
  seed: map.seed,
  textures: {}, // WIP refactor & documentation
  spritesheets: {} // WIP refactor & documentation
})

const landmarks = [] // WIP refactor & documentation 
const renderOpts = {} 
renderer.update(landmarks, renderOpts)
```

### Rendering options 
```js
{
  renderBiomesTexture: true,
  renderLandmarks: true,
  renderPoisson: false,
  renderVoronoiCells: false,
  renderVoronoiSites: false,
  fillVoronoiCells: false,
  scale: 1,
  smooth: false,
  forceUpdate: false,
  drawBoundingBox: false,
  debugPerf: false,
  colors: {
    background: 'white',
    voronoi: 'red',
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
```

## License
[MIT.](https://tldrlegal.com/license/mit-license)
