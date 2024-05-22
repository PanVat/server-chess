const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo('server');
const PORT = 3000;

app.use(express.static('public'));

io.on('connection', () => {
    console.log("Připojil se uživatel");
    server.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

app.listen(PORT, () => {
    console.log("Server naslouchá na portu " + PORT);
});