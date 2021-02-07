//VERSION=3
//S5P Formaldehyde (HCHO)

function setup() {
    return {
        input: ["HCHO", "dataMask"],
        output: { bands:  1 , sampleType: "FLOAT32"}
    }
}

function evaluatePixel(sample) {
    if (sample.dataMask == 1){
        return [sample.HCHO]
    } else {
        return [-9999]
    }
}