const express = require('express');
const http = require('node:http');
const { Server } = require('socket.io');

const app = express();
const users = new Map();
const userUnits = new Map();
const playerBattles = new Map();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_battle', (battleId) => {
        socket.join(battleId);
    });

    socket.on('send_message', (data) => {
        io.emit('receive_message', {
            user: data.user,
            text: data.text,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('send_battle_message', (data) => {
        const { battleId, text, user } = data;
        io.to(battleId).emit('receive_battle_message', {
            user: user,
            text: text,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('send_private_message', (data) => {
    const { targetUsername, text } = data;
    const senderName = users.get(socket.id);

    const targetSocketId = [...users.entries()]
        .find(([id, name]) => name === targetUsername)?.[0];

    if (targetSocketId) {
        const messagePayload = {
            from: senderName,
            text: text,
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }
        io.to(targetSocketId).emit('receive_private_message', messagePayload);
        socket.emit('receive_private_message', { ...messagePayload, from: senderName });
    }
});

    socket.on('set_username', (username) => {
        users.set(socket.id, username); 
        io.emit('update_user_list', Array.from(users.values()));
    });

    socket.on('disconnect', () => {
        users.delete(socket.id);
        userUnits.delete(socket.id);
        io.emit('update_user_list', Array.from(users.values()));
    });

    socket.on('send_challenge', (data) => {
        const senderName = users.get(socket.id);

        userUnits.set(socket.id, data.units);
        
        const targetSocketId = [...users.entries()]
            .find(([id, name]) => name === data.targetUser)?.[0];

        if (targetSocketId) {
            io.to(targetSocketId).emit('receive_challenge', { 
                from: senderName 
            });
        }
    });
    
    socket.on('leave_battle', () => {
        const battleId = playerBattles.get(socket.id);
        if (battleId) {
            socket.to(battleId).emit('battle_end_signal', { 
                winner: true, 
                reason: 'opponent_leave' 
            });
            socket.leave(battleId);
            playerBattles.delete(socket.id);
        }
    });

    socket.on('accept_challenge', (data) => {
        const receiverSocketId = socket.id;
        const receiverName = users.get(receiverSocketId);

        userUnits.set(receiverSocketId, data.units);

        const challengerSocketId = [...users.entries()]
            .find(([id, name]) => name === data.challenger)?.[0];

       if (challengerSocketId) {
            const battleId = `battle_${Date.now()}`;
            playerBattles.set(socket.id, battleId);
            playerBattles.set(challengerSocketId, battleId);
            
            socket.join(battleId);
            const challengerSocket = io.sockets.sockets.get(challengerSocketId);
            if (challengerSocket) {
                challengerSocket.join(battleId);
            }

            const challengerUnits = userUnits.get(challengerSocketId); 
            const receiverUnits = userUnits.get(receiverSocketId);

            io.to(challengerSocketId).emit('game_start', { 
                battleId, 
                opponentName: receiverName,
                opponentUnits: receiverUnits, 
                role: 'host' 
            });

            io.to(receiverSocketId).emit('game_start', { 
                battleId, 
                opponentName: data.challenger,
                opponentUnits: challengerUnits, 
                role: 'guest' 
            });
        }
    });

    socket.on('battle_action', (data) => {
        socket.to(data.battleId).emit('opponent_action', data);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});