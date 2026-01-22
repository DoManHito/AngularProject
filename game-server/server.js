const express = require('express');
const http = require('node:http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_battle', (battleId) => {
        socket.join(battleId);
        console.log(`User ${socket.id} joined battle: ${battleId}`);
    });

    socket.on('send_message', (data) => {
        io.to(data.battleId).emit('receive_message', {
            user: data.user,
            text: data.text,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});