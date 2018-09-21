/**
 * NOTE:
 * there is two possible data-structures to describe a sprite object:
 *
 * array: ["filename", probability[,scale[,opacity[,layerIndex]]]]
 * object:
    {
      "file": (string),
      "density": (float),
      "scale": (float),
      "opacity": (float),
      "layer": (int)
    }
 *
 * This module takes care of converting the first data-structure (mainly here for
 * retro-compatiblity purpose) to the second one.
 */

module.exports = o => {
  const isArr = Array.isArray(o)
  return {
    name: isArr ? o[0] : o.file,
    probability: isArr ? o[1] : o.density,
    scale: (isArr ? o[2] : o.scale) || 1,
    opacity: (isArr ? o[3] : o.opacity) || 1,
    layerIndex: (isArr ? o[4] : o.layer) || 0
  }
}
