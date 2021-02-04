
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

        fetch("http://localhost:3000/api/v1/process/" + dataProcessing).then(_getResponseText).then(script => {
            log('success', 'SCRIPT: ' + script);

            const body = JSON.stringify({
                "input": {
                    "bounds": {
                        "bbox": [
                            13,
                            45,
                            15,
                            47
                        ]
                    },
                    "data": [
                        {
                            "type": "S5PL2",
                            "dataFilter": {
                                "timeRange": {
                                    "from": "2018-12-28T00:00:00Z",
                                    "to": "2018-12-31T00:00:00Z"
                                }
                            }
                        }
                    ]
                },
                "output": {
                    "width": 512,
                    "height": 512
                },
                "evalscript": "`" + script + "`"
            });

            log('info', 'Body \n' + JSON.stringify(body))

            fetch("https://services.sentinel-hub.com/api/v1/process", {
                method: "POST",
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    Accept: '*/*'
                },
                body: body
            }).then(image => {
                // console.log(image.buffer());
                callback(null, image.blob());
            }).catch(error => {
                log('error', 'ERROR GET IMAGE ... ' + JSON.stringify(error))
                callback(error, null);
            });

        }).catch(error => {
            log('error', 'ERROR GET SCRIPT ... ' + JSON.stringify(error))
            callback(error, null);
        })
    }).catch(error => {
        log('error', 'ERROR GET TOKEN ... ' + JSON.stringify(error))
        callback(error, null);
    });

}

module.exports = {
    getToken,
    getRateLimit,
    runProcess
}