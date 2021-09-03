var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://pplcnt-mqtt.e-motion.ai')
// var client = mqtt.connect('mqtt://18.237.68.217')

client.on("connect", function(){	
  console.log("connected: " + client.connected);
  client.publish('presence', 'Hello mqtt')
})

client.subscribe('presence', function (err) {
  console.log("subscribed")
})

client.on('message', function(topic, message) {
  console.log(topic + " " + message.toString())
  //client.end()
})