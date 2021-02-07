//VERSION=3
//S5P Sulfur Dioxide (SO2)

function setup() {
    return {
        input: ["SO2", "dataMask"],
        output: { bands: 2 }
    }
}

function evaluatePixel(sample, scene) {
    var maxVal = 0.01; 
    return [sample.SO2/maxVal, sample.dataMask]
}