//=============================================================================
//
//   http_server.js - ViroGuard http server module
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
//   http = require('http_server');
//     ...
//   http.register('/api/update_profile', 'POST', handle_update_profile);
//     ...
//   http.register('/api/get_profile', 'GET', handle_get_profile);
//     ... 
//   http.start();
//
//=============================================================================
'use strict'
const http = require('http');
const g = require('./globals');

var post_dispatch_tbl = {}; 
var get_dispatch_tbl = {}; 

//-----------------------------------------------------------------------------
//  Register an endpoint and its callback
//
//  Returns false is the endpt is already occupied; otherwise returns true 
//
//-----------------------------------------------------------------------------
function register(instance, endpt, entry) { 
   var rc = false;
   if (entry.type == 'POST') { 
      if ( !(endpt in post_dispatch_tbl) ) {
         post_dispatch_tbl[endpt] = entry.action.bind(instance);
         rc = true;
      }
   }
   else if (entry.type == 'GET') {
      if ( !(endpt in get_dispatch_tbl) ) {
         get_dispatch_tbl[endpt] = entry.action.bind(instance);
         rc = true;
      }
   }
   return rc;
}

//-----------------------------------------------------------------------------
//  POST dispatcher of registered endpt and action 
//-----------------------------------------------------------------------------
function post_dispatch(endpt, data, res) {
   console.log(endpt)
   if (endpt in post_dispatch_tbl) {
      post_dispatch_tbl[endpt](endpt, data, res);
   }
}

//-----------------------------------------------------------------------------
//  GET dispatcher of registered endpt and action 
//-----------------------------------------------------------------------------
function get_dispatch(endpt, res) {
   if (endpt in get_dispatch_tbl) {
      get_dispatch_tbl[endpt](endpt, res);
   }
}

//-----------------------------------------------------------------------------
//  Start the HTTP server
//-----------------------------------------------------------------------------
function start(preamble='api') {
   http.createServer(function(req, res) {
      res.setHeader('Access-Control-Allow-Origin','*');
      res.setHeader('Access-Control-Allow-Methods','OPTIONS,GET,POST');
      res.setHeader('Access-Control-Allow-Headers','*');
   
      if (req.method == 'OPTIONS') {
         res.writeHead(204);
         res.end();
      }
      else if (req.method == 'POST') {
         console.log("POST request received!")
         // console.log(post_dispatch_tbl)
         // console.log(req.url)
         var body = '';

         req.on('data', function(data) {
            body += data
         });

         // Extract body
         req.on('end', function() {
            body = body.replace(/=/g, ":");
            body = body.replace(/%3A/g, ":");
            body = body.replace(/%7B/g, "{");
            body = body.replace(/%7D/g, "}");
            body = body.replace(/%22/g, "\"");
            body = body.replace(/%2C/g, ",");
            body = body.replace(/%5B/g, "[");
            body = body.replace(/%5D/g, "]");

            try { 
               var strs = req.url.split('/');
                if ((strs.length >= 3) && (strs[1] == preamble)) {
                   var endpt = "/"+strs[2];
                   for (var i=3; i<strs.length; i++) {
                      endpt = [endpt, strs[i] ].join('/');
                   }
               console.log(body[0])
                  post_dispatch(endpt, JSON.parse(body), res);
	       }
            }
            catch(e) {
               g.dprint(0, "Error in HTTP 1: ", e);
               res.writeHead(400, {'Content-Type': 'text'});
               res.end("Server POST error");     
            }
         });
      }
      else if (req.method == 'GET') {
        console.log("GET request received!")
      //   console.log(get_dispatch_tbl)
      //   console.log(req.url)
      try { 
        var strs = req.url.split('/');
        if ((strs.length >= 3) && (strs[1] == preamble)) {
           var endpt = "/"+strs[2];
           for (var i=3; i<strs.length; i++) {
              endpt = [endpt, strs[i] ].join('/');
           }
           post_dispatch(endpt, JSON.parse(body), res);
        }
      }
         catch(e) {
            g.dprint(0, "Error in HTTP 2: ", e);
            res.writeHead(400, {'Content-Type': 'text'});
            res.end("Server GET error");     
         }
      }
      else {
         g.dprint(0, "Error in HTTP 3: ");
      }
   }).listen(3000);
}

module.exports.post_dispatch_tbl=post_dispatch_tbl;
module.exports.get_dispatch_tbl=get_dispatch_tbl;
module.exports.register = register;
module.exports.start = start;
