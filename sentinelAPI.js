
var log = require('logbootstrap');
const fileType = require('file-type');

var axios = require('axios');
var qs = require('qs');

const FormData = require('form-data');
const fetch = require('node-fetch');
const fs = require('file-system');

const path = require('path');

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

let _getscript = (data, callback) => {

    fetch("http://localhost:3000/api/v1/process/" + data).then(_getResponseText).then(script => { 
        log('success', 'OK Script.');
        callback(null, script)
    }).catch(error => {
        log('error', 'ERROR GET SCRIPT ... ' + JSON.stringify(error))
        callback(error, null);
    });
    
};

let _getRequest = () => {

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

    return JSON.stringify(request);

}

let runProcess = (clientID, clientSecret, data, callback) => {

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

        _getscript(data, (err, script) => {

            log('info', 'SCRIPT \n' + JSON.stringify(script));

            let request = _getRequest();
            log('info', 'REQUEST \n' + request);

            const body = new FormData;
            body.append('request', request);
            body.append("evalscript", script);

            var headers = {
                "Authorization": "Bearer " + token,
                'Content-Type': `multipart/form-data; boundary=${body._boundary}`,
                "Accept-Encoding": "gzip, deflate, br",
                "Accept": "*/*",
                "Connection": "keep-alive"
            };

            var config = {
                method: 'post',
                url: 'https://creodias.sentinel-hub.com/api/v1/process',
                headers: headers,
                data : body
            };

            axios.interceptors.response.use(response => {
                // let data = selected[0].image2.data;
                return response.data.toString('base64');
                //return response;
            }, error => {
                return Promise.reject(error);
            });

            axios(config).then(response => {
                log('success', JSON.stringify(response));
                callback(null, response)
            }).catch(error => {
                log('error', error);
                callback(error, null);
            });

        })
    
    }).catch(error => {
        log('error', 'ERROR GET TOKEN ... ' + JSON.stringify(error))
        callback(error, null);
    });

};

module.exports = {
    getToken,
    getRateLimit,
    runProcess
}