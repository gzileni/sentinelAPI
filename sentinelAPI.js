
var log = require('logbootstrap');

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

/*
let _getDataProcess = async (body, token, callback) => {

    
    
    log('info', 'stating data process ... ');

    const instance = axios.create({
        baseURL: 'https://creodias.sentinel-hub.com/api/v1'
    });

    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    instance.defaults.headers.post['Content-Type'] = 'application/json';

    const form = new FormData();
    form.append('request', JSON.stringify(body.request));
    form.append('evalscript', JSON.stringify(body.evalscript));
    
    await instance.post('/process', form).then(response => {
        log('success', 'OK -> ' + JSON.stringify(response));
        callback(null, response.data);
    }).catch(error => {
        log('error', 'Error GET Image -> ' + JSON.stringify(error));
        callback(error, null)
    });
    
}
*/


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

            fetch("https://services.sentinel-hub.com/api/v1/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                "input": {
                    "bounds": {
                    "bbox": [
                        13.822174072265625,
                        45.85080395917834,
                        14.55963134765625,
                        46.29191774991382
                    ]
                    },
                    "data": [{
                        "type": "S5PL2",
                        "dataFilter": {
                            "timeRange": {
                                "from": "2020-12-01T00:00:00Z",
                                "to": "2020-12-31T00:00:00Z"
                            }
                        }
                    }]
                },
                "evalscript": script
                })

            }).then(res => {
                log('success', JSON.stringify(res));
                const dest = fs.createWriteStream('./temp/image.jpg');
                res.body.pipe(dest);
            }).catch(error => {
                log('error', 'ERROR GET IMAGE ... ' + JSON.stringify(error))
                callback(error, null);
            })
        }).catch(error => {
            log('error', 'ERROR GET SCRIPT ... ' + JSON.stringify(error))
            callback(error, null);
        })
    }).catch(error => {
        log('error', 'ERROR GET TOKEN ... ' + JSON.stringify(error))
        callback(error, null);
    });


}

// -------------------------------------------------------------------
/*
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
    }).then(token_response => {

        log('success', 'OK GET TOKEN ... ' + JSON.stringify(token_response);

        fetch("http://localhost:3000/api/v1/process/" + dataProcessing, {
            method: "GET"
        }).then(script_response => {
            
            log('success', 'OK GET SCRIPT ... ' + JSON.stringify(script_response));

            fetch("https://services.sentinel-hub.com/api/v1/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + response
                },
                body: JSON.stringify({
                "input": {
                    "bounds": {
                    "bbox": [
                        13.822174072265625,
                        45.85080395917834,
                        14.55963134765625,
                        46.29191774991382
                    ]
                    },
                    "data": [{
                        "type": "S5PL2",
                        "dataFilter": {
                            "timeRange": {
                                "from": "2020-12-01T00:00:00Z",
                                "to": "2020-12-31T00:00:00Z"
                            }
                        }
                    }]
                },
                "evalscript": response.data
                })

            }).then(batch_response => {
                log('success', 'OK RUN PROCESS ... ' + JSON.stringify(batch_response.json()))
                callback(null, batch_response.text());
            }).catch(error => {
                log('error', 'ERROR RUN PROCESS ... ' + JSON.stringify(error))
                callback(error, null);
            });

        }).catch(error => {
            log('error', 'ERROR GET SCRIPT ... ' + JSON.stringify(error))
            callback(error, null);
        });

        
    }).catch(error => {
        log('error', 'ERROR GET TOKEN ... ' + JSON.stringify(error))
        callback(error, null);
    });

    /*
    getToken(clientID, clientSecret, (err, token) => {

        if (err != null) {
            log('error', 'Error TOKEN -> ' + JSON.stringify(err))
            callback(err, null);
        } else {

            /*
            axios.get('http://localhost:3000/api/v1/process/' + dataProcessing).then(response => {

                log('info', 'SCRIPT RECEVING ... OK ');

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
                                        "from": "2020-12-01T00:00:00Z",
                                        "to": "2020-12-31T00:00:00Z"
                                    }
                                }
                            }
                        ]
                    },
                    "output": {
                        "width": 512,
                        "height": 512
                    }
                };
                */

                /*
                const form = new FormData();
                form.append('request', request);
                form.append('evalscript', response.data);
                */

                /*
                var data = {
                    request: request,
                    evalscript: response.data
                };
                */

                // log('info', '\n ---- Data ---- \n' + JSON.stringify(data));

                

                // _getDataProcess(data, token, callback);
                /*
            }).catch(error => {
                log('error', 'ERROR RUN PROCESS ... ' + JSON.stringify(error))
                callback(error, null);
            });
   
        }
    });
    */
// };


module.exports = {
    getToken,
    getRateLimit,
    runProcess
}