require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const connectDB = require("./config/database");
const configurePassport = require("./config/passport");
const mqttHandler = require("./config/mqttClient.js");
const WebSocket = require("ws");
const validateData = require("./middleware/validateData.js");
const IoTPacket = require("./models/data.js");

const app = express();

const wss = new WebSocket.Server({ port: 3001 });

function broadcastMessage(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });
});

// Database Connection
connectDB();

// Passport Configuration
configurePassport(passport);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth.js");
const dashboardRoutes = require("./routes/index.js");
app.use("/", authRoutes);
app.use("/", dashboardRoutes);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mqttHandler.on("message", (topic, message) => {
  if (topic.startsWith("data/")) {
    try {
      const jsonMessage = JSON.parse(message.toString());
      if (validateData(jsonMessage)) {
        broadcastMessage(jsonMessage);
        const data = new IoTPacket(jsonMessage);
        data.save();
        const deviceId = topic.split("/")[1];
        console.log("Device ID: <", deviceId, ">");
        console.log(
          "####################### START OF DATA PACKET #####################"
        );
        console.log(jsonMessage);
        console.log(
          "######################## END OF DATA PACKET ######################"
        );
      } else {
        console.log("Invalid Data");
      }
    } catch (error) {
      console.error("Failed to parse message as JSON", error);
    }
  } else if (topic.startsWith("connection/")) {
    const deviceId = topic.split("/")[1];
    console.log(
      "Device ID: <",
      deviceId,
      ">\tConnection status:",
      message.toString() == "1" ? "Connected" : "Disconnected"
    );
  } else {
    console.log(`Received message on ${topic}: ${message}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
