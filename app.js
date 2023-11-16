const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 5000;

require('./src/db/connection');
const Message = require('./src/models/messagesSchema');


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A new client has Connected');
    Message.find({})
        .then((messages) => {
            socket.emit('load messages', messages);
        });

    socket.on('username', async (username) => {
        console.log('the logged in user is ' + username);
        io.emit('user joined', username);
    });

    socket.on('chat message', (msg, imageSent, sender) => {
        const message = new Message ({
            author:msg.author,
            content:msg.content,
            image:msg.image
        });
        message
            .save()
            .then(() => {
                io.emit('chat message', msg)
            })
            .catch((Error) => console.error(Error));
    });
});

server.listen(PORT, () => {
    console.log(`App is listening on PORT ${PORT}`);
});