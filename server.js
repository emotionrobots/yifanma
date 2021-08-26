const app = require('./index')
const https = require('https')
const fs = require('fs')

// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/pc3-backend.e-motion.ai/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/pc3-backend.e-motion.ai/fullchain.pem')
//   }

// httpsServer = https.createServer(options, app)

// httpsServer.listen(9000, (err) => {
//     if(err) throw err
//     console.log('Server running in http://127.0.0.1:9000')
// })

// const httpsServer = https.createServer({
//     key: fs.readFileSync('/etc/letsencrypt/live/pc3-backend.e-motion.ai/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/pc3-backend.e-motion.ai/fullchain.pem'),
//   }, app);

app.listen(9000, (err) => {
    if(err) throw err
    console.log('Server running in http://127.0.0.1:9000')
})