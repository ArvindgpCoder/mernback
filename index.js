const express = require('express');
const { createServer } = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
const PORT = 5000;

app.get("/", (req, res) => {
    res.send("Server is running");
});

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);
    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        socket.broadcast.emit("callEnded");
    });

    socket.on('calluser', ({ userToCall, signalData, from, name }) => {
        console.log(`Calling user: ${userToCall} from: ${from} with signal: ${signalData}`);
        io.to(userToCall).emit("calluser", { signal: signalData, from, name });
    });

    socket.on('answercall', (data) => {
        console.log(`Answering call to: ${data.to} with signal: ${data.signal}`);
        io.to(data.to).emit("callaccepted", data.signal);
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
