//=============================================================================
//
//   layer.js - Basic layer class module 
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
//   The Layer class is the base class for implementing a set of HTTP/MQTT
//   API calls.  Association of endpoint name and the handler is done using
//   two tables:  mqtt_dispatch_tbl  and  http_dispatch_tbl
//
//=============================================================================
'use strict'
class Layer {

   constructor() {
       this.mqtt_dispatch_tbl = {};
       this.http_dispatch_tbl = {};
   }

   //---------------------------------------------------------------------------
   //  Bind module's mqtt topic/action to a mqtt server 
   //---------------------------------------------------------------------------
   bind_mqtt(mqtt_server) {
      for (var topic in this.mqtt_dispatch_tbl) {
         mqtt_server.register(this, topic, this.mqtt_dispatch_tbl[topic]);
      }
   }

   //-----------------------------------------------------------------------------
   //  Add a mqtt entry
   //-----------------------------------------------------------------------------
   add_mqtt_entry(topic, action) {
      if (!(topic in this.mqtt_dispatch_tbl)) {
         this.mqtt_dispatch_tbl[topic] = action; 
      }
   }

   //-----------------------------------------------------------------------------
   //  Delete a mqtt entry
   //-----------------------------------------------------------------------------
   del_mqtt_entry(topic) {
      if (topic in this.mqtt_dispatch_tbl) {
         delete this.mqtt_dispatch[topic];
      }
   }

   //-----------------------------------------------------------------------------
   //  Bind module's http endpt/action to a http server 
   //-----------------------------------------------------------------------------
   bind_http(http_server) {
      for (var endpt in this.http_dispatch_tbl) {
         http_server.register(this, endpt, this.http_dispatch_tbl[endpt]);
      };
   }

   //-----------------------------------------------------------------------------
   //  Add a http entry
   //-----------------------------------------------------------------------------
   add_http_entry(endpt, type, action) {
      var entry = {};
      entry.type = type;
      entry.action = action;
      if (!(endpt in this.http_dispatch_tbl)) {
         this.http_dispatch_tbl[endpt] = entry;
      }
   }

   //-----------------------------------------------------------------------------
   //  Remove a http entry
   //-----------------------------------------------------------------------------
   del_http_entry(endpt) {
      if (endpt in this.http_dispatch_tbl) {
         delete this.http_dispatch[endpt];
      }
   }

   //-----------------------------------------------------------------------------
   // HTML response  - utility function
   //-----------------------------------------------------------------------------
   html_resp(res, code, type, data) {
      res.writeHead(code, {'Content-Type': type});
      res.end(data);
   }

}

module.exports = Layer;
