const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const Filter = require('bad-words');
const generateMessage = require("./utils/messages");

const {addUser,removeUser,getUser,getUsersInRoom} = require("./utils/users");



const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 4000;
const publicDirectoryPath = path.join(__dirname,"../public");
app.use(express.static(publicDirectoryPath));


let count = 0;
io.on('connection',(socket)=>{
    socket.on('join', ({ username , room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room });
        if(error){
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('getMessage',generateMessage({text:"welcome"}));
        socket.broadcast.to(user.room).emit("getMessage",generateMessage({
            text:`${user.username} has join to chat`}));


        io.to(room).emit('userList',{room,userList:getUsersInRoom(room)});

        callback();

        socket.on('sendMessage',(newMessage,callback)=>{
            const user = getUser(socket.id);
            const filter = new Filter();
            io.to(room).emit('getMessage',generateMessage({
                text:filter.clean(newMessage),
                username:user.username,
                id:user.id
            }));
            callback()
        });

        socket.on('disconnect',()=>{
            io.to(room).emit("getMessage",generateMessage({text:`${username} leaved the chat`}));
            removeUser(socket.id)
            io.to(room).emit('userList',{room,userList:getUsersInRoom(room)});
        });

        socket.on("sendLocation",(location,callback)=>{
            const user=getUser(socket.id);
            io.to(user.room).emit("locationMessage",generateMessage({text:`https://google.com/maps?q=${location.latitude},${location.longitude}`,username:user.username}));
            callback("send back Ack")
        })
    
    });
});



server.listen(port, () => {
    console.log(`Server started on port ${port} is running...`);
});