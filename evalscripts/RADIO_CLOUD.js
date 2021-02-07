//VERSION=3
//S5P Effective radiometric cloud fraction

function setup() {
    return {
      input: ["CLOUD_FRACTION", "dataMask"],
      output: { bands:  4 }
    }
}

const minVal = 0.0
const maxVal = 1.0
const diff = maxVal - minVal
const rainbowColors = [
    [minVal, [0, 0, 0.5]],
    [minVal + 0.125 * diff, [0, 0, 1]],
    [minVal + 0.375 * diff, [0, 1, 1]],
    [minVal + 0.625 * diff, [1, 1, 0]],
    [minVal + 0.875 * diff, [1, 0, 0]],
    [maxVal, [0.5, 0, 0]]
]

const viz = new ColorRampVisualizer(rainbowColors)

function evaluatePixel(sample) {
    var rgba = viz.process(sample.CLOUD_FRACTION)
    rgba.push(sample.dataMask)
    return rgba
}