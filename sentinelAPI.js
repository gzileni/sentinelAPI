
var log = require('logbootstrap');
const fileType = require('file-type');

var axios = require('axios');
var qs = require('qs');

const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('file-system');

var dotenv = require('dotenv');
dotenv.config();

// ----------------------------------------------------------------------------------------------------------
// Requesting tokens
async function getToken (clientID, clientSecret, callback) {

    var client_id = clientID || process.env.CLIENT_ID;
    var client_secret = clientSecret || process.env.CLIENT_SECRET

    const instance = axios.create({
        baseURL: 'https://services.sentinel-hub.com'
    });
    
    const config = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };

    const body = qs.stringify({
      client_id,
      client_secret,
      grant_type: "client_credentials"
    });

    // log('info', 'Request TOKEN by ' + JSON.stringify(body))
  
    await instance.post("/oauth/token", body, config).then((resp) => {
        log('info', 'get token OK.');
        callback(null, resp.data.access_token);
    }).catch(err => {
        log('error', 'Error TOKEN -> ' + JSON.stringify(err))
        callback(err, '');
    })
};

// ----------------------------------------------------------------------------------------------------------
// Requesting tokens
async function getRateLimit (instance_id, callback) {
  
    await instance.get('/ogc/wms/' + instance_id).then((resp) => {
        callback(null, JSON.stringify(resp.data));
    }).catch((err) => {
        callback(err, {});
    })
};

function _getResponseText(res) {
    
    if (res.ok) { // res.status >= 200 && res.status < 300
        return res.text();
    } else {
        return res.statusText;
    }

};

let runProcess = (clientID, clientSecret, dataProcessing, callback) => {

    fetch("http://localhost:3000/api/v1/sentinel/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "clientID": clientID, 
            "clientSecret": clientSecret
        })
    }).then(_getResponseText).then(token => {
        
        console.log('TOKEN: ' + JSON.stringify(token));

        _getImage(token, callback);

        /*

        fetch("http://localhost:3000/api/v1/process/" + dataProcessing).then(_getResponseText).then(script => {
            
            log('success', 'SCRIPT: ' + script);

            var request = {
                input: { 
                    bounds: {
                        properties: {
                            crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                        },
                        bbox: [
                            13,
                            45,
                            15,
                            47
                        ]
                    },
                    data: [
                        {
                            type: "S5PL2",
                            dataFilter: {
                                timeRange: {
                                    from: "2020-12-28T00:00:00Z",
                                    to: "2020-12-31T00:00:00Z"
                                }
                            }
                        }
                    ]
                },
                output: {
                    width: 512,
                    height: 512
                }
            };

            console.log(JSON.stringify(request));

            const body = new FormData;
            body.append('request', JSON.stringify(request));
            // body.append("evalscript", script);
            body.append('evalscript', "//VERSION=3\nfunction setup() {\n  return {\n    input: [\"CO\", \"dataMask\"],\n    output: { bands:  4 }\n  }\n}\n\nconst minVal = 0.0\nconst maxVal = 0.1\nconst diff = maxVal - minVal\n\nconst rainbowColors = [\n    [minVal, [0, 0, 0.5]],\n    [minVal + 0.125 * diff, [0, 0, 1]],\n    [minVal + 0.375 * diff, [0, 1, 1]],\n    [minVal + 0.625 * diff, [1, 1, 0]],\n    [minVal + 0.875 * diff, [1, 0, 0]],\n    [maxVal, [0.5, 0, 0]]\n]\n\nconst viz = new ColorRampVisualizer(rainbowColors)\n\nfunction evaluatePixel(sample) {\n    var rgba= viz.process(sample.CO)\n    rgba.push(sample.dataMask)\n    return rgba\n}");

            fetch("https://creodias.sentinel-hub.com/api/v1/process", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "multipart/form-data",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Connection": "keep-alive"
                },
                body: body,
                redirect: 'follow'
            }).then(image => image.blob()).then(image => {
                callback(null, image);
            }).catch(error => {
                log('error', 'ERROR GET IMAGE ... ' + JSON.stringify(error))
                callback(error, null);
            });

        }).catch(error => {
            log('error', 'ERROR GET SCRIPT ... ' + JSON.stringify(error))
            callback(error, null);
        });
        */

    }).catch(error => {
        log('error', 'ERROR GET TOKEN ... ' + JSON.stringify(error))
        callback(error, null);
    });

}

let _getImage = (token, callback) => {

    var formdata = new FormData();
    formdata.append("request", "{\n    \"input\": {\n        \"bounds\": {\n            \"properties\": {\n                \"crs\": \"http://www.opengis.net/def/crs/OGC/1.3/CRS84\"\n            },\n            \"bbox\": [\n                13,\n                45,\n                15,\n                47\n            ]\n        },\n        \"data\": [\n            {\n                \"type\": \"S5PL2\",\n                \"dataFilter\": {\n                    \"timeRange\": {\n                        \"from\": \"2020-12-28T00:00:00Z\",\n                        \"to\": \"2020-12-31T00:00:00Z\"\n                    }\n                }\n            }\n        ]\n    },\n    \"output\": {\n        \"width\": 512,\n        \"height\": 512,\n        \"responses\": [\n          {\n                \"format\": {\n                    \"type\": \"image/png\"\n                }\n          }\n        ]\n\n    }\n}");
    formdata.append("evalscript", "//VERSION=3\nfunction setup() {\n  return {\n    input: [\"CO\", \"dataMask\"],\n    output: { bands:  4 }\n  }\n}\n\nconst minVal = 0.0\nconst maxVal = 0.1\nconst diff = maxVal - minVal\n\nconst rainbowColors = [\n    [minVal, [0, 0, 0.5]],\n    [minVal + 0.125 * diff, [0, 0, 1]],\n    [minVal + 0.375 * diff, [0, 1, 1]],\n    [minVal + 0.625 * diff, [1, 1, 0]],\n    [minVal + 0.875 * diff, [1, 0, 0]],\n    [maxVal, [0.5, 0, 0]]\n]\n\nconst viz = new ColorRampVisualizer(rainbowColors)\n\nfunction evaluatePixel(sample) {\n    var rgba= viz.process(sample.CO)\n    rgba.push(sample.dataMask)\n    return rgba\n}");

    var requestOptions = {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "multipart/form-data",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Accept": "*/*"
        },
        body: formdata,
        redirect: 'follow'
    };

    fetch("https://creodias.sentinel-hub.com/api/v1/process", requestOptions)
    .then(response => response.blob())
    .then(result => callback(null, result))
    .catch(error => {
        log('error', JSON.stringify(error))
        callback(error, null)
    });

}

module.exports = {
    getToken,
    getRateLimit,
    runProcess
}