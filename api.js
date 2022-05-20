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
const cognitoJwtVerifier = require('aws-jwt-verify');

var WITHHOLD = false

function recurse(callback){
    if(WITHHOLD){
        // console.log("withholding" + cnt++)
        setTimeout(() => { recurse(callback) }, 100);
    } else {
        callback()
    }
}
const INTERVALS = 10

// Verifier that expects valid access tokens:
const verifier = cognitoJwtVerifier.CognitoJwtVerifier.create({
    userPoolId: "us-east-1_pLyQY4wgB",
    tokenUse: "access",
    clientId: "4mc316gdmd3o7637bqoqp2j99f",
})

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

        //    this.add_http_entry('/user_login', 'POST', this.user_login);
        this.add_http_entry('/get_user_orgs', 'POST', this.get_user_orgs);
        this.add_http_entry('/get_history', 'POST', this.get_history);
        this.add_http_entry('/get_occupancy', 'POST', this.get_occupancy);
        this.add_http_entry('/get_hourly_poschange', 'POST', this.get_hourly_poschange);
        this.add_http_entry('/get_hourly_negchange', 'POST', this.get_hourly_negchange);
    }

    /*
    Verifies user access token with cognito and returns the user's ID from the database.
    */
    verify_jwt(token, callback) {
        verifier.verify(
            token
        ).then((payload) => {
            db.addUserIfNotExist(payload.username, (result) => {
                if(result.error == 0) {
                    callback(true, result.user_id)
                } else {
                    callback(true, result.message)
                }
            })
        },
            () => {
                console.log("Token not valid!");
                callback(false, null)
            });
    }

    get_user_orgs(url, data, res) {
        this.verify_jwt(data.token, (result, user_id) => {
            if (!result) {
                res.writeHead(401, {});
                res.end();
                return;
            }
            db.getUserAssociation(user_id, (result) => {
                var rJ = {}
                for (var i = 0; i < result.length; i++) {
                    const d = result[i]
    
                    if (!(d.org_id in rJ)) {
                        rJ[d.org_id] = {
                            name: d.org_name,
                            desc: null,
                            date_creation: null,
                            cameraGroups: {}
                        }
                    }
    
                    if (!(d.room_id in rJ[d.org_id].cameraGroups)) {
                        rJ[d.org_id]["cameraGroups"][d.room_id] = {
                            name: d.room_name,
                            cameras: []
                        }
                    }
    
                    if (d.camera_id != null) {
                        rJ[d.org_id]["cameraGroups"][d.room_id]["cameras"].push({
                            name: d.device_name
                        })
                    }
                }
    
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(rJ));
            },
                (err) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ result: null, err: err.code }));
                })
        })
    }

    get_history(url, data, res) {
        /*
        Add params
        */

        this.verify_jwt(data.token, (result, payload) => {
            if (result) {
                // TODO: Check if user has permission to view data
                // TODO: retrieve all data and put it into the database
                // for loop 
                // db.addCameraHistory(cam id, data change)

                //TODO: Change 1 to camera_id
                // try {
                let start = new Date(data.start)
                let end = new Date(data.end)

                recurse(() => {
                // console.log(start + '\n' + end + '\n' + result)
                db.getAllEntriesWithin(start.toISOString(), end.toISOString(), data['room_id'], (result) => {
                    let time_interval = (end - start) / (INTERVALS)
                    var curr_interval = 0;
                    var num_of_ppl = 0;
                    var num_entered = 0;
                    var num_exited = 0;
                    var arr = []

                    var entry_ind = 0;

                    for(var i = 0; i < INTERVALS; i ++){
                        let curr_time = new Date(start * 1 + time_interval * i)

                        while(entry_ind < result.length && curr_time >= new Date(result[entry_ind].date)){
                            let entry = result[entry_ind]
                            num_of_ppl += entry.count
                            if(entry.count > 0){
                                num_entered += entry.count
                            } else {
                                num_exited += Math.abs(entry.count)
                            }
                            entry_ind++;
                        }
                        // Locale default to EN_US
                        // + '/' + (curr_time.getFullYear() % 100)
                        arr.push({name: curr_time.getMonth() + 1 + '/' + curr_time.getDate(), personExit: num_exited, personEnter: num_entered, peopleInside: num_of_ppl })
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(arr));
                    return
                },
                    (err) => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: err
                        }));
                    })})
                // } catch (error) {
                //     res.writeHead(200, { 'Content-Type': 'application/json' });
                //     res.end(JSON.stringify({
                //         error: error
                //     }));
                // }
            } else {
                res.writeHead(401, {});
                res.end();
                return;
            }

        })
    }


    get_occupancy(url, data, res) {
        //   mqtt.publish('/history', "Send all data!")
        this.verify_jwt(data.token, (result, payload) => {
            if (result) {
                mqtt.publish('/history', 'get history')
                WITHHOLD = true

                recurse(() => {
                    // TODO: Check if user has permission to view data
                    // TODO: retrieve all data and put it into the database
                    // for loop 
                    // db.addCameraHistory(cam id, data change)

                    //TODO: Change 1 to camera_id
                    console.log(data['room_id'])
                    db.getCurrentPeopleInRoom(data['room_id'], (result) => {
                        const sum = result.reduce((partialSum, a) => partialSum + a.count, 0);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            cardType: InfoWidgetTypes.SINGLE,
                            attributes: {
                                data: sum + " People in the Room",
                                icon: "human"
                            }
                        }));
                    },
                        (err) => {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                cardType: InfoWidgetTypes.SINGLE,
                                attributes: {
                                    data: "An error occured",
                                    icon: "human"
                                }
                            }));
                        })
                })
            } else {
                res.writeHead(401, {});
                res.end();
                return;
            }

        })
    }

    retrieve_people_this_hour(res, isPos, room_id, tok) {
        //TODO: Change 1 to camera_id
        this.verify_jwt(tok, (result, payload) => {
            if (result) {
                recurse(() => {
                    db.getAllEntriesWithin(new Date(new Date().setHours(new Date().getHours() - 1)).toISOString(), new Date().toISOString(), room_id, (result) => {
                        const sum = result.reduce((partialSum, a) => partialSum + ((isPos ? (a.count > 0) : (a.count < 0)) ? a.count : 0), 0);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            cardType: InfoWidgetTypes.SINGLE,
                            attributes: {
                                data: Math.abs(sum) + " People " + (isPos ? "Entered" : "Left") + " in the Past Hour",
                                icon: (isPos ? "enter" : "exit")
                            }
                        }));
                    },
                        (err) => {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                cardType: InfoWidgetTypes.SINGLE,
                                attributes: {
                                    data: "An error occured",
                                    icon: (isPos ? "enter" : "exit")
                                }
                            }));
                        })
                })
        } else {
            res.writeHead(401, {});
            res.end();
            return;
        }})
    }

    get_hourly_poschange(url, data, res) {
        this.retrieve_people_this_hour(res, true, data['room_id'], data.token)
    }

    get_hourly_negchange(url, data, res) {
        this.retrieve_people_this_hour(res, false, data['room_id'], data.token)
    }

    get_user_association(url, data, res) {
        /*
        returns the user's association with organizations and
        rooms and cameras
        */
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end("meow");
    }
}

function stopWithholding(){
    WITHHOLD = false
}

module.exports = api;
module.exports.stopWithholding = stopWithholding;