
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
    var client_secret = clientSecret || process.env.CLIENT_SECRET;

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

let _getscript = (options, callback) => {

    fetch(options.url + "/api/v1/process?evalscript=" + options.evalscript).then(_getResponseText).then(script => { 
        log('success', 'OK Script.');
        callback(null, script)
    }).catch(error => {
        log('error', 'ERROR GET SCRIPT ... ' + JSON.stringify(error))
        callback(error, null);
    });
    
};

let _getRequest = (options) => {

    var request = {
        input: { 
            bounds: {
                properties: {
                    crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                },
                bbox: options.bbox
            },
            data: [
                {
                    type: "S5PL2",
                    dataFilter: {
                        timeRange: {
                            from: options.fromUTC,
                            to: options.toUTC
                        }
                    }
                }
            ]
        },
        output: {
            width: options.width,
            height: options.height
        }
    };

    return JSON.stringify(request);

}

let runProcess = (options, callback) => {

    fetch(options.url + "/api/v1/sentinel/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "clientID": options.clientID, 
            "clientSecret": options.clientSecret
        })
    }).then(_getResponseText).then(token => {
        
        console.log('TOKEN: ' + JSON.stringify(token));

        _getscript(options, (err, script) => {

            log('info', 'SCRIPT \n' + JSON.stringify(script));

            let request = _getRequest(options);
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

            var requestOptions = {
                method: 'POST',
                body: body,
                redirect: 'follow',
                headers: headers
            };
              
            fetch("https://creodias.sentinel-hub.com/api/v1/process", requestOptions)
            .then(response => response.blob())
            .then(result => callback(null, result))
            .catch(error => callback(error, null));

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