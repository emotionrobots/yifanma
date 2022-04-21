//=============================================================================
//
//   api.js - people counter module  
//
//   Property of E-Motion, Inc.
//   
//   Copyright(c) 2020-2021 E-Motion, Inc
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, 
//   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES 
//   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
//   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
//   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
//   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR 
//   OTHER DEALINGS IN THE SOFTWARE.
//
//   Description:
//
//   People counter device is based on Raspberry Pi, and the protocol
//   from the people counter is mostly MQTT.  Therefore this layer is 
//   primarily MQTT handlers dispatched based on the topic string
//
//=============================================================================
'use strict'
const fs = require('fs');
const AWS = require('aws-sdk');
const Layer = require('./layer');
const g = require('./globals');
const http = require('./http_server')
const db = require('./database')

class api extends Layer {
    constructor() {
       super();

       this.add_http_entry('/user_login', 'POST', this.user_login);
       this.add_http_entry('/get_history', 'GET', this.get_history);
       this.add_http_entry('/get_occupancy', 'GET', this.get_occupancy);
       this.add_http_entry('/get_hourly_change', 'GET', this.get_hourly_change);
       this.add_http_entry('/get_daily_change', 'GET', this.get_daily_change);
       this.add_http_entry('/get_user_association', 'GET', this.get_user_association);
    }

    user_login(url, data, res){
        /*
        validate user access token with cognito
        grant user access for session
        */
    }

    get_history(url, res){
        /*
        Add params
        */

        //TODO: Change 1 to camera_id
        db.get_entry_log(1, function (err, result, fields) {
            if(err) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({result: result, err: err.code}));
                throw err;
            }
            console.log(result)
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({result: result, err: 0}));
        })
    }

    get_occupancy(url, res){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("meow");
    }

    get_hourly_change(url, res){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("meow");
    }

    get_daily_change(url, res){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("meow");
    }

    get_user_association(url, res){
        /*
        returns the user's association with organizations and
        rooms and cameras
        */
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end("meow");
    }
}

module.exports = api;