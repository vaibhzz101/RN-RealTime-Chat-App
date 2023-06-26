const express = require("express")
const socketio = require("socket.io")
const http = require("http")
const app = express()
const { userJoin, getRoomUsers, getCurrentUser, userLeave } = require("./utils/users")
const formateMessage = require("./utils/messages")
const server = http.createServer(app)
const io = socketio(server)
const boatName = "Masai Server";
const cors = require("cors")
const {userRouter} = require("./routes/user.routes");
const {authentication} = require("./middleware/authentication");
const {connection } = require("./config/db")

io.on("connection", (socket) => {
   console.log("one client joined")

    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room)
       socket.join(user.room);
       // Welcome current 
        socket.emit("message", formateMessage(boatName, "Welcome to Masai Server"))
         // broadcat to other users
        socket.broadcast.to(user.room).emit("message", formateMessage(boatName, `${user.username} has joined the chat`))
        //  Get all room user
        io.to(user.room).emit("roomUsers", {
            room: user.room, users: getRoomUsers(user.room)
        })

    })
    socket.on("chatMessage",(msg)=>{
          const user = getCurrentUser(socket.id)
          io.to(user.room).emit("message",formateMessage(user.username,msg))
    });
    socket.on("disconnect",()=>{
        const user = userLeave(socket.id)
        io.to(user.room).emit("message",formateMessage(boatName,`${user.username} has left the chat`))
         //  Get all room user
          io.to(user.room).emit("roomUsers", {
            room: user.room, users: getRoomUsers(user.room)
        })

    })

});

app.use(cors())

app.use(express.json())
app.get('/', (req,res)=>{
   res.send("Welcome to RealTimeChat App")
})
app.use("/user", userRouter);
app.use(authentication)

const PORT = process.env.PORT || 7070;
server.listen(process.env.PORT, async()=>{
  try{
      await connection;
      console.log(`connected to DB and running on ${process.env.PORT}`)
  }
  catch(err){
      console.log(err)
  }
   })