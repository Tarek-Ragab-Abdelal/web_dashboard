const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.hivemq.com:1883'); // Replace with your broker's URL and port

client.on('connect', function () {
    console.log('MQTT client connected');
    client.subscribe('your/topic', function (err) {
        if (!err) {
            console.log('Subscribed to topic successfully!');
        }
    });
});

client.on('message', function (topic, message) {
    // message is a buffer
    console.log(message.toString());
    handleMessage(topic, message);
});

function handleMessage(topic, message) {
    // Parse and store message in the database
    console.log(`Received message on ${topic}: ${message.toString()}`);
    // Include your message parsing logic here
    // Call saveMessageToDB(parsedData) after parsing
}

module.exports = client;
