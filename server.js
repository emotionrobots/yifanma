const app = require('./index')

const httpsServer = https.createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/pplcnt-web.e-motion.ai/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/pplcnt-web.e-motion.ai/fullchain.pem'),
  }, app);

httpsServer.listen(9000, (err) => {
    if(err) throw err
    console.log('Server running in http://127.0.0.1:9000')
})