const http = require("http");
const express = require("express");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3001, () => {
  console.log("WS is running on port 3001");
});

function broadcastMessage(data) {
  io.sockets.emit("broadcast_message", data);
}

module.exports = broadcastMessage;
