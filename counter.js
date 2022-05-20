//=============================================================================
//
//   counter.js - people counter module  
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
const api = require('./api')

class pplCounter extends Layer {
   constructor() {
      super();

      //-----------------------------------------------------------------------
      //  MQTT registry
      //-----------------------------------------------------------------------
      this.add_mqtt_entry('/presence', this.PresenceHandler);
      this.add_mqtt_entry('/history', this.HistoryHandler);
   }

   //--------------------------------------------------------------------------
   //  PresenceHandler 
   //--------------------------------------------------------------------------
   PresenceHandler(topic, message, client) {

    // params format:
    // {"device":"rpi4", "deviceid":16, "location":"Store entrance", 
    //         "datetime":"2021/10/13 16:35:02", "enter":1, "exit":5}

    // fake MQTT publish message
    // mosquitto_pub -h 'mqtt.e-motion.ai' -t "/presence" -m "{\"device\": \"rpi4\", \"deviceid\": 16, \"location\": \"Store entrance\", \"datetime\": \"2021/10/13 16:35:02\", \"enter\": 1, \"exit\": 20}"

    var params = JSON.parse(message.toString())
    g.dprint(3, message.toString())
    g.dprint(3, "Called PresenceHandler", params["device"]);

    counter += params["enter"] - params["exit"];
 }

   //--------------------------------------------------------------------------
   //  HistoryHandler
   //--------------------------------------------------------------------------
   HistoryHandler(topic, message, client) {
      try{
      var params = JSON.parse(message.toString())
      var array2d = new Array(params.body.length)
      for(var i = 0; i < array2d.length; ++i) {
         array2d[i] = new Array(3)
         array2d[i][0] = params.cam_serial
         for (var j = 1; j <= 2; ++j)
         array2d[i][j] = params.body[i][j-1]
      }
      db.insertEntryLogs(array2d, (status) => {
         if(!("status" in status)){
            console.log("ERR: " + status.err)
         }

         console.log("saved " + array2d)

         api.stopWithholding()
      });
      } catch (err) {
         console.log("Caputured: " + message)
      }
 }

}

module.exports = pplCounter;
