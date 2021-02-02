
var log = require('logbootstrap');

var axios = require('axios');
var qs = require('qs');

const FormData = require('form-data');

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
  
    await instance.post("/oauth/token", body, config).then((resp) => {
        log('info', 'get tokek OK \n' + resp.data.access_token);
        callback(null, resp.data.access_token);
    }).catch((err) => {
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

let _getDataProcess = async (form, token, callback) => {
    
    const instance = axios.create({
        baseURL: 'https://creodias.sentinel-hub.com/api/v1'
    });

    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // instance.defaults.headers.post['Content-Type'] = 'application/json';
    // instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    await instance.post('/process', form).then(response => {
        log('success', 'OK -> ' + JSON.stringify(response));
        callback(null, response.data);
    }).catch(error => {
        log('error', 'Error GET Image -> ' + JSON.stringify(error));
        callback(error, null)
    });
}


// -------------------------------------------------------------------
let runProcess = async (clientID, clientSecret, dataProcessing, callback) => {

    getToken(clientID, clientSecret, (err, token) => {

        if (err != null) {
            log('error', 'Error TOKEN -> ' + JSON.stringify(err))
            callback(err, null);
        } else {

            axios.post('http://localhost:3000/api/v1/dataprocess/' + dataProcessing).then(response => {

                log('info', 'SCRIPT RECEVING ... ' + response.data);

                const request = { 
                    "input": {
                        "bounds": {
                            "properties": {
                                "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                            },
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
                    }
                }

                log('info', 'Data: ' + JSON.stringify(request));

                const form = new FormData();
                form.append('request', request);
                form.append('evalscript', response.data);

                _getDataProcess(form, token, callback);
                
            }).catch(error => {
                log('error', 'ERROR RUN PROCESS ... ' + JSON.stringify(error))
                callback(error, null);
            });
        }
    });
};

module.exports = {
    getToken,
    getRateLimit,
    runProcess
}