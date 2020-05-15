const express = require("express");
const http = require("http");
const path = require("path");
const port = process.env.PORT || 3000;
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// serve static files
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

// provide an event and cb to run when that happens
io.on("connection", (socket) => {
  // to get the message taken from the form
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity not allowed");
    }
    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback();
  });
  // disconnect is a build in event
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(
          "Chat App",
          `${user.username} has left ${user.room} room.`
        )
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
  // handle location
  socket.on("locationMessage", (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "newLocationMessage",
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });
  // for join
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    console.log("user:", user);
    console.log("error:", error);
    if (error) {
      return callback(error);
    }

    // new functions to mit only to a particular room: socket.broadcast.to.emit - io.to.emit
    socket.emit(
      "message",
      generateMessage("Chat App", `Welcome to ${user.room} room, ${user.username}!`)
    );
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Chat App", `${user.username} has joined!`));
    socket.join(user.room);
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
    callback();
  });
});

server.listen(port, () => console.log(`Listening to chat app on port ${port}`));
