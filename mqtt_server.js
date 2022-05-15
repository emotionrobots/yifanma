//=============================================================================
//
//   mqtt_server.js - ViroGuard mqtt server module
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
//   Usage:
//
//   mqtt = require('mptt_server');
//     ...
//   mqtt.register(topic, action);
//     ... 
//   mqtt.start(broker_ip, username, password);
//
//
//=============================================================================
'use strict'
const mqtt = require('mqtt');
const fs = require('fs');
const g = require('./globals');

var dispatch_tbl = {}; 
var client = null;

//-----------------------------------------------------------------------------
//  Register a topic and its callback
//
//  Returns false is the topic is already registered; otherwise returns true 
//
//  Usage:
//         function process_msg(data) {
//           
//            // 'Do ometing with the data'
//
//            resp.data = "Got message";
//            resp.type = "text";
//            resp.ok = true;
//            return resp;
//         }
//
//         mqtt_handler.register('/api/send_message', process_msg);
//
//-----------------------------------------------------------------------------
function register(instance, topic, action) { 
   var rc = false;
   if ( !(topic in dispatch_tbl) ) {
      dispatch_tbl[topic] = action.bind(instance);
      rc = true;
   }
   return rc;
}

//-----------------------------------------------------------------------------
//  Publish a message
//-----------------------------------------------------------------------------
function publish(topic, msg) {
   client.publish(topic, msg);
}

//-----------------------------------------------------------------------------
//  Dispatcher of registered topic and action 
//-----------------------------------------------------------------------------
function dispatch(topic, msg) {
   for ( const [key, action] of Object.entries(dispatch_tbl) ) {   
      if (topic.includes(key)) { 
         dispatch_tbl[key](topic, msg, client);
      }
   }
}

//-----------------------------------------------------------------------------
//  Start the MQTT server
//-----------------------------------------------------------------------------
function start(broker, usrname, pwd, ca_cert) {

   var client = mqtt.connect(broker, {
      // username : usrname,
      // password : pwd,
      // ca: fs.readFileSync(ca_cert),
      // port: 8883,
      // rejectUnauthorized: false
   });

   client.on('connect', function () {
      client.subscribe("#", function (err) {
         if (err) {
            g.dprint(0, "Error MQTT 1: ", err);
	       }
      });
   });

   client.on('message', function (topic, message) {
/*
      g.dprint(3, "\nMQTT Message Received - "+Date());
      g.dprint(3, "topic: "+topic.toString());
      g.dprint(3, "message: "+message.toString());
*/

      try {
         dispatch(topic, message);
      }
      catch(e) {
         g.dprint(0, "Error MQTT 2: ", e);
      }
   });
}


module.exports.register = register;
module.exports.start = start;
