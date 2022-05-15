//=============================================================================
//
//   globals.js - Global resource module 
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
//   global.<variable> are already global to other modules so no need to 
//   export them
//
//=============================================================================

'use strict'
const https = require('https');
const fs = require('fs');
const mqtt = require('mqtt');
const mysql = require('mysql');
const AWS = require('aws-sdk');

global.version = "0.2.2";	     // Server version
global.verbosity = 4;

//  Debug print
function dprint(v, label, param='') {
   let verbo = global.verbosity;
   if (v <= verbo) {
      // console.log(timestamp()+' '+label);
      console.log(label);
      console.log(param);
   }
}

/*
// Connect to AWS
AWS.config.update({
   accessKeyId: <use your own access key>,
   secretAccessKey: <use your own secret key>,
   region: 'us-east-1',});  // replace with your RES region

// Connect to Cognito
global.cognito = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

// Connect to SQL with retry
// Replace host, user, password, database with your own values
const sql_config = {
   host: <use your own RDS url>,
   port:"3306",
   user: <use your own RDS username>,
   password: <use your own RDS password>,
   database: <use your RDS instance name>,
   multipleStatements: true
};
  
//--------------------------------------------------------------
//  Reconnect to SQL
//--------------------------------------------------------------
function sql_connect(config) {
   let s = mysql.createConnection(config)
   s.connect();
   return s;
}

global.sql = sql_connect(sql_config);

global.sql.on('error', function(err) {
   if ( err.code === 'PROTOCOL_CONNECTION_LOST') {
      dprint(0, "MySQL error - PROTOCOL_CONNECTION_LOST", err);
      global.sql = sql_connect(sql_config);
   }
   else {
      dprint(0, "MySQL error -", err);
      throw err;
   }
});
*/

// Export only functions, not global
module.exports.dprint=dprint;
