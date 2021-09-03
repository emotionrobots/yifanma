const express = require('express');
const https = require('https');
const http = require('http')
const fs = require('fs');
app = express()
const port = 9002;

var key = fs.readFileSync('/etc/letsencrypt/live/pc3-backend.e-motion.ai/privkey.pem');
var cert = fs.readFileSync('/etc/letsencrypt/live/pc3-backend.e-motion.ai/fullchain.pem');
var options = {
key: key,
cert: cert
};

app.get('/', (req, res) => {
//      res.redirect('http://example.com');
   res.send('Test Account'); // only http work as of right now
});
app.listen(9001, () => {
  console.log("default app starting on port : " + 9001)
});

// const server = https.createServer(options, app);
// server.listen(port, () => {
//   console.log("server starting on port : " + port)
// });

const httpServer = http.createServer(app)
httpServer.listen(9000)