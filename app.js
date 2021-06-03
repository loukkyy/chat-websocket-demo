const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const { format } = require("date-fns")
const {
  addUser,
  removeUser,
  getCurrentUser,
  getUsersByRoom,
} = require("./users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

// run when a client connects
io.on("connection", (socket) => {
  socket.on("join-room", ({ username, room }, callback) => {
    // add user to room
    console.log(`${username} has joined room ${room}`)
    const user = addUser(socket.id, username, room)

    socket.join(user.room)
    callback(`Welcome to the chat room ${room}`, getUsersByRoom(user.room))

    // broadcast when a user connects
    socket.to(user.room).emit("message", {
      username: "ChatBot",
      message: `${user.username} has joined the room`,
      datetime: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
      users: getUsersByRoom(user.room),
    })

    // send chat message to room
    socket.on("send-message", (chatMessage, callback) => {
      const user = getCurrentUser(socket.id)
      socket.to(user.room).emit("message", {
        username: user.username,
        message: chatMessage,
        datetime: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
        clientId: socket.id,
        users: getUsersByRoom(user.room),
      })
      callback(true)
    })
  })

  // runs when client disconnects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id)
    if (user) {
      console.log(`${user.username} has disconnected`)
      io.to(user.room).emit("message", {
        username: "ChatBot",
        message: `${user.username} has left the room`,
        datetime: format(new Date(), "dd/MM/yyyy hh:mm:ss"),
        clientId: socket.id,
        users: getUsersByRoom(user.room),
      })
    }
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
