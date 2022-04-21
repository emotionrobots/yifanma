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

var counter = 0;

class pplCounter extends Layer {
   constructor() {
      super();

      //-----------------------------------------------------------------------	    
      //  HTTP registry 
      //-----------------------------------------------------------------------	    
	
      /* Insert POST handleris below */

      /* Insert GET handlers below */
		this.add_http_entry('/update_counter', 'GET', this.update_counter);

      //-----------------------------------------------------------------------	    
      //  MQTT registry
      //-----------------------------------------------------------------------	    
      this.add_mqtt_entry('/entry', this.EntryHandler);
      this.add_mqtt_entry('/exit', this.ExitHandler);
      this.add_mqtt_entry('/presence', this.PresenceHandler);
   }

   update_counter(url, res) {
      g.dprint(3, "Called update_counter");
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(counter.toString());
      counter = 0;
   }
	 
   //--------------------------------------------------------------------------
   //  EntryHandler 
   //--------------------------------------------------------------------------
   EntryHandler(topic, message, client) {
      g.dprint(3, "Called EntryHandler");

      var params = JSON.parse(message.toString())
       
      /* Do something here... note no ens.end() type return */

   }

   //--------------------------------------------------------------------------
   //  ExitHandler 
   //--------------------------------------------------------------------------
   ExitHandler(topic, message, client) {
      g.dprint(3, "Called ExitHandler");

      var params = JSON.parse(message.toString())
       
      /* Do something here... note no ens.end() type return */

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
	  
    // TODO: handle malformed data
    // ex: test if JSON key is available
    // ex2: try, catch, accept

    var params = JSON.parse(message.toString())
    g.dprint(3, message.toString())
    g.dprint(3, "Called PresenceHandler", params["device"]);

    counter += params["enter"] - params["exit"];
 }

}  // pplCounter

module.exports = pplCounter;
