var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://18.237.68.217')

client.on("connect", function(){	
  console.log("connected  " + client.connected);
  client.subscribe('presence', function (err) {
    console.log("subscribed")
  })
})

client.on('message', function(topic, message) {
  // message is Buffer
  console.log(message.toString())
  //client.end()
})