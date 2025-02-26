// Import necessary modules
const mqtt = require("mqtt");
const EventEmitter = require("events");

class MqttHandler extends EventEmitter {
  constructor() {
    super();
    this.client = null;
    this.connect();
  }

  connect() {
    // Retrieve environment variables
    const brokerUrl = process.env.MQTT_BROKER_URL;
    const options = {
      port: 1883,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    };

    // Connect to MQTT Broker
    this.client = mqtt.connect(brokerUrl, options);

    this.client.on("connect", () => {
      console.log("MQTT Connected to Broker:", brokerUrl);
      this.emit("connected");
      this.subscribe(process.env.MQTT_CONNECTION_TOPIC);
      this.subscribe(process.env.MQTT_DATA_TOPIC);
    });

    this.client.on("message", (topic, message) => {
      console.log(`Message received under topic: ${topic}`);
      this.emit("message", topic, message.toString());
    });

    this.client.on("error", (error) => {
      console.error("MQTT Error:", error);
      this.emit("error", error);
    });
  }

  subscribe(topic) {
    this.client.subscribe(topic, (err) => {
      if (!err) {
        console.log(`Subscribed to topic: ${topic}`);
      } else {
        console.error(`Could not subscribe to topic: ${topic}`, err);
      }
    });
  }

  publish(topic, message) {
    this.client.publish(topic, message, (err) => {
      if (err) {
        console.error(`Error publishing to topic: ${topic}`, err);
      } else {
        console.log(`Published message to topic: ${topic}`);
      }
    });
  }
}

module.exports = new MqttHandler();
