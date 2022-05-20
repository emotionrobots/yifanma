//=============================================================================
//
//   server.js - API server top-level
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
//=============================================================================
'use strict'
const http_server = require('./http_server');
const mqtt_server = require('./mqtt_server'); 
const Web = require('./web');
const pplCounter = require('./counter');
const api = require('./api')
const g = require('./globals');
const db = require('./database')

// Set debug print (dprint) verbosity
if (process.argv.length > 2) 
   global.verbosity = process.argv[2];

// Below is a debug print statement. First parameter is debug verbosity level
// If the value is lower than global.verbosity, the statement will print; 
// silent otherwise
g.dprint(0, "Running with verbosity: ", global.verbosity);

db.initialize_db()

/* Register console dispatch */
var frontend = new Web();
// frontend.bind_mqtt(mqtt_server); 
frontend.bind_http(http_server); 


/* Register console dispatch */
var pplc = new pplCounter();
pplc.bind_mqtt(mqtt_server); 
pplc.bind_http(http_server);   // can comment out since there is no HTTP POST/GET

var apim = new api();
apim.bind_http(http_server);

/* Start MQTT server */
mqtt_server.start('mqtt://mqtt.e-motion.ai');

/*
// Start secure MQTT server
mqtt_server.start('mqtts://mqtt.e-motion.ai',
	          <mqtt username>,
	          <mqtt password>,
	          <ca_certificate>
);
*/

/* Start HTTP server using 'api' route */
http_server.start('api')
