const { createServer } = require("http");
const { Server } = require("socket.io");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, { /* options */ });

    io.on("connection", (socket) => {
        console.log("a user connected");

        
        socket.on("message",(data)=>{
            console.log('Message from client:', data);
            socket.emit("reply","Hello from server");
        })
        
        
    
        socket.on('disconnect',()=>{
            console.log(socket.id,"disconnected");
            
        })
    });
    
}

module.exports = { initSocketServer }