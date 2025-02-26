import mqtt from "precompiled-mqtt";

class IoTDashboard {
  constructor() {
    this.client = null;
    this.statusElement = document.getElementById("status");
    this.messagesElement = document.getElementById("messages");
    this.subscribeTopic = document.getElementById("subscribe-topic");
    this.subscribeBtn = document.getElementById("subscribe-btn");
    this.publishTopic = document.getElementById("publish-topic");
    this.publishMessage = document.getElementById("publish-message");
    this.publishBtn = document.getElementById("publish-btn");
    this.clearBtn = document.getElementById("clear-messages-btn");

    this.initializeMQTT();
    this.setupEventListeners();
  }

  initializeMQTT() {
    // Connect to a public MQTT broker
    const brokerUrl =
      "wss://d67be805fa04427888f359269ec3c793.s1.eu.hivemq.cloud:8884/mqtt";

    this.client = mqtt.connect(brokerUrl, {
      username: "WebTest1",
      password: "WebTest1",
    });

    this.client.on("connect", () => {
      this.statusElement.textContent = "Connected";
      this.statusElement.classList.add("connected");
      this.client.publish("test/connection", "Connected to MQTT broker");
    });

    this.client.on("error", (error) => {
      console.error("MQTT Error:", error);
      this.statusElement.textContent = "Error";
      this.statusElement.classList.remove("connected");
    });

    this.client.on("message", (topic, message) => {
      this.displayMessage(topic, message.toString());
    });

    this.clearBtn.addEventListener("click", () => {
      const messagesElement = document.getElementById("messages");
      messagesElement.innerHTML = ""; // Clears the content of the messages element
    });
  }

  setupEventListeners() {
    this.subscribeBtn.addEventListener("click", () => {
      const topic = this.subscribeTopic.value.trim();
      if (topic) {
        this.client.subscribe(topic);
        this.displayMessage("System", `Subscribed to topic: ${topic}`);
      }
    });

    this.publishBtn.addEventListener("click", () => {
      const topic = this.publishTopic.value.trim();
      const message = this.publishMessage.value.trim();

      if (topic && message) {
        this.client.publish(topic, message);
        this.displayMessage("System", `Published to ${topic}: ${message}`);
        this.publishMessage.value = "";
      }
    });
  }

  displayMessage(topic, message) {
    const messageElement = document.createElement("div");
    messageElement.className = "message";

    // Get current date and time
    const now = new Date();
    const formattedDate = now.toLocaleString(); // Formats the date and time according to locale

    // Set the inner HTML of the message element
    messageElement.innerHTML = `
      <div class="topic">${topic}</div>
      <div class="topic">${formattedDate}</div>
      <div class="content">${message}</div>
    `;

    // Prepend the message at the start of the messages container
    if (this.messagesElement.firstChild) {
      this.messagesElement.insertBefore(
        messageElement,
        this.messagesElement.firstChild
      );
    } else {
      this.messagesElement.appendChild(messageElement);
    }

    // Ensure the newest message is visible
    this.messagesElement.scrollTop = 0; // Scrolls to the top of the container
  }
}

// Initialize the dashboard when the page loads
new IoTDashboard();
