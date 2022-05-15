//=============================================================================
//
//   web.js - Web console module 
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
//   Implement the web frontend API handlers
//
//=============================================================================
'use strict'
const fs = require('fs');
const AWS = require('aws-sdk');
const Layer = require('./layer');
const g = require('./globals');


class Web extends Layer {
   constructor() {
      super();

      //-----------------------------------------------------------------------	    
      // POST
      //-----------------------------------------------------------------------	    
      this.add_http_entry('/myEndpoint1', 'POST', this.myEndpoint1);

      // Add more POST handlers below as required...
	   
	  
	 
      //-----------------------------------------------------------------------	    
      // GET
      //-----------------------------------------------------------------------	    
      this.add_http_entry('/version', 'GET', this.version);

      // Add more GET handlers below as required...
      
   } 

   //==========================================================================
   //   HTTPS actions
   //==========================================================================
	 
   /* POST actions */

   //--------------------------------------------------------------------------
   //  /myEndpoint1 handler - a method of Web class
   //--------------------------------------------------------------------------
   myEndpoint1(url, body, res) {
      g.dprint(3, "Called myEndpoint1");

      let params = JSON.parse(body);

      g.dprint(3, "myEndpoint1 body is", body);

      /* Do something here... return value is the argument of res.end(.)
         Make sure the content type is consistent with the value. In the
	 example below, text/html is sent back the browser */

      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end("Success")
   }



   /* GET actions */

   //--------------------------------------------------------------------------
   //  version 
   //--------------------------------------------------------------------------
   version(url, res) {
      g.dprint(3, "Called version");
      g.dprint(3, "version is", global.version);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(global.version);
   }
}

module.exports = Web;
