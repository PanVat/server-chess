const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const Chess = require('chess.js').Chess;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

let game = new Chess();
let players = { white: null, black: null };

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log("Connected user");

    // Přidání hráče
    if (!players.white) {
        players.white = socket.id;
        socket.emit('setColor', 'w');
    } else if (!players.black) {
        players.black = socket.id;
        socket.emit('setColor', 'b');
    } else {
        socket.emit('full', true);
        socket.disconnect();
        return;
    }

    // Poslat aktuální stav hry novému hráči
    socket.emit('gameState', game.fen());

    socket.on('move', (move) => {
        const moveResult = game.move(move);
        if (moveResult) {
            io.emit('move', moveResult);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        if (socket.id === players.white) {
            players.white = null;
        } else if (socket.id === players.black) {
            players.black = null;
        }
    });
});

server.listen(PORT, () => {
    console.log("Server listens at port " + PORT);
});
