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
//const g = require('./globals');
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
			http.register('/update_counter', 'GET', this.update_counter);

      //-----------------------------------------------------------------------	    
      //  MQTT registry 
      //-----------------------------------------------------------------------	    
      this.add_mqtt_entry('/entry', this.EntryHandler);
      this.add_mqtt_entry('/exit', this.ExitHandler);

			http.start();
   } 

   update_counter(url, res) {
      res.send(counter);
      counter = 0;
   }
	 
   //--------------------------------------------------------------------------
   //  EntryHandler 
   //--------------------------------------------------------------------------
   EntryHandler(topic, message, client) {
      g.dprint(3, "Called EntryHandler");

      var params = JSON.parse(message.toString())
       
      /* Do something here... note no ens.end() type return */
			++counter;
			
			// debug
			console.log(params);
   }

   //--------------------------------------------------------------------------
   //  ExitHandler 
   //--------------------------------------------------------------------------
   ExitHandler(topic, message, client) {
      g.dprint(3, "Called ExitHandler");

      var params = JSON.parse(message.toString())
       
      /* Do something here... note no ens.end() type return */
			--counter;

	 }

}  // pplCounter 

module.exports = pplCounter;
