
var log = require('logbootstrap');

var axios = require('axios');
var qs = require('qs');

var dotenv = require('dotenv');
dotenv.config();

const instance = axios.create({
    baseURL: 'https://services.sentinel-hub.com'
});

const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    }
};

let getScript = (dataProcessing) => {

    if (dataProcessing == 'CO') {
        return require('./scripts/CO');
    }

}

// ----------------------------------------------------------------------------------------------------------
// Requesting tokens
async function getToken (clientID, clientSecret, callback) {

    var client_id = clientID || process.env.CLIENT_ID;
    var client_secret = clientSecret || process.env.CLIENT_SECRET

    const body = qs.stringify({
      client_id,
      client_secret,
      grant_type: "client_credentials"
    });
  
    await instance.post("/oauth/token", body, config).then((resp) => {
        callback(null, resp.data.access_token);
    }).catch((err) => {
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

// -------------------------------------------------------------------
let runProcess = (clientID, clientSecret, dataProcessing, callback) => {

    var config = {
        baseURL: 'https://creodias.sentinel-hub.com/api/v1'
    };

    var request =  {
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
        }
    };

    log('info', JSON.stringify(request))

    var output = {
        "width": 512,
        "height": 512
    };

    log('info', JSON.stringify(output))

    const body = qs.stringify({
        request: request,
        output: output,
        evalscript: getScript(dataProcessing)
    });

    log('info', JSON.stringify(body))

    getToken(clientID, clientSecret, (err, token) => {
      
        if (err != null) {
        callback(err, null);
      } else {

        Object.assign(instance.defaults, { headers: { authorization: `Bearer ${token}` } });

        instance.post('/process', body, config).then(response => {
            console.log(response);
            callback(null, response.data);
        }).catch(error => {
            callback(error, null)
        });
      }
      
    });
  
}

module.exports = {
    getToken,
    getRateLimit,
    runProcess
}