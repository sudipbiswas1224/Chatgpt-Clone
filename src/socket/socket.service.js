const { createServer } = require("http");
const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");


function initSocketServer(httpServer) {
    const io = new Server(httpServer, { /* options */ });

    //check if user is loggedin or not (SOCKET IO MIDDLEWARE)
    io.use(async (socket, next) => {
        //get the token from the header of socket io
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        //if token is not present 
        if (!cookies.token) {
            return next(new Error("Authentication error: No token found"))
        }

        // verify token
        const token = cookies.token;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await userModel.findOne({ _id: decoded.userId });
            if (!user) {
                return next(new Error('Authentication error : User not found'))
            }
            socket.user = user;

            next();
        } catch (err) {
            return next(new Error('Authentication error : Invalid token'))
        }


    })

    /* let the client connect with server after verification */
    io.on("connection", (socket) => {
        console.log("user connected :", socket);


        socket.on("message", (data) => {
            console.log('Message from client:', data);
            socket.emit("reply", "Hello from server");
        })



        socket.on('disconnect', () => {
            console.log(socket.id, "disconnected");

        })
    });

}

module.exports = { initSocketServer }