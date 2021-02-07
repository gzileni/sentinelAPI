//VERSION=3
//S5P Ozone (O3)

function setup() {
    return {
        input: ["O3", "dataMask"],
        output: { bands: 2 }
    }
}

function evaluatePixel(sample, scene) {
    var maxVal = 0.36; 
    return [sample.O3/maxVal, sample.dataMask]
}
