//VERSION=3
//S5P Aerosol Index 354 and 388

var val = AER_AI_354_388;

var minVal = -1.0;
var maxVal = 5.0;
var diff = maxVal - minVal;

var limits = [minVal, minVal + 0.125 * diff, minVal + 0.375 * diff, minVal + 0.625 * diff, minVal + 0.875 * diff, maxVal];
var colors = [[0,0,0.5], [0,0,1], [0,1,1], [1,1,0], [1,0,0], [0.5,0,0]];

var ret = colorBlend(val, limits, colors);
ret.push(dataMask);
return ret;