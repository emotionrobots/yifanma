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
const mqtt = require('./mqtt_server')
const db = require('./database')

const InfoWidgetTypes = {
    SINGLE: "infocard.single",
    REPORT: "infocard.report",
    CHART: "infocard.chart",
    LOADING: "infocard.waiting",
    SETTINGS: "infocard.settings",
    LISTPLUSINFO: "infocard.listinfo"
}

class api extends Layer {
    constructor() {
       super();

       this.add_http_entry('/user_login', 'POST', this.user_login);
       this.add_http_entry('/get_user_orgs', 'GET', this.get_user_orgs);
       this.add_http_entry('/get_history', 'GET', this.get_history);
       this.add_http_entry('/get_occupancy', 'GET', this.get_occupancy);
       this.add_http_entry('/get_hourly_poschange', 'GET', this.get_hourly_poschange);
       this.add_http_entry('/get_hourly_negchange', 'GET', this.get_hourly_negchange);
    }

    user_login(url, data, res){
        /*
        validate user access token with cognito
        grant user access for session
        */
    }

    // Temporarily assume user is id 2
    get_user_orgs(url, res) {
        db.getUserAssociation(2, (result) => {
            var rJ = {}
            for (var i = 0; i < result.length; i++) {
                const d = result[i]

                if(!(d.org_id in rJ)) {
                    rJ[d.org_id] = {
                        name: d.org_name,
                        desc: null,
                        date_creation: null,
                        cameraGroups: {}
                    }
                }

                if(!(d.room_id in rJ[d.org_id])){
                    rJ[d.org_id]["cameraGroups"][d.room_id] = {
                        name: d.room_name,
                        cameras: []
                    }
                }

                if(d.camera_id != null) {
                    rJ[d.org_id]["cameraGroups"][d.room_id]["cameras"].push({
                        name: d.device_name
                    })
                }
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(rJ));
        },
        (err) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({result: null, err: err.code}));
        })
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

    verify_authenticity(){
        // TODO: Implement with cognito
    }

    get_occupancy(url, res){
      mqtt.publish('/history', "Send all data!")

    // TODO: retrieve all data and put it into the database
      // for loop 
      // db.addCameraHistory(cam id, data change)

        //TODO: Change 1 to camera_id
        db.getCurrentPeopleInRoomToday(1, (result) => {
            const sum = result.reduce((partialSum, a) => partialSum + a.count, 0);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                cardType: InfoWidgetTypes.SINGLE,
                attributes: {
                    data: sum + " People in the Room",
                    icon: "human"
                }
            }));
        },
        (err) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                cardType: InfoWidgetTypes.SINGLE,
                attributes: {
                    data: "An error occured",
                    icon: "human"
                }
            }));
        })
    }

    retrieve_people_this_hour(res, isPos){
        //TODO: Change 1 to camera_id
        db.getCurrentPeopleInRoomCurrentHour(1, (result) => {
            const sum = result.reduce((partialSum, a) => partialSum + ((isPos ?(a.count > 0) : (a.count < 0)) ? a.count : 0), 0);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                cardType: InfoWidgetTypes.SINGLE,
                attributes: {
                    data: Math.abs(sum) + " People " + (isPos ? "Entered" : "Left") + " in the Past Hour",
                    icon: "enter"
                }
            }));
        },
        (err) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                cardType: InfoWidgetTypes.SINGLE,
                attributes: {
                    data: "An error occured",
                    icon: "enter"
                }
            }));
        })
    }

    get_hourly_poschange(url, res){
        this.retrieve_people_this_hour(res, true)
    }

    get_hourly_negchange(url, res){   
        this.retrieve_people_this_hour(res, false)
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