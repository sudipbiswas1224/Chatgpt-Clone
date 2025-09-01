const { createServer } = require("http");
const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");
const { generateResponse } = require("../services/ai.service");
const messageModel = require("../models/message.model");



function initSocketServer(httpServer) {
    const io = new Server(httpServer, { /* options */ });

    //check if user is logged in or not (SOCKET IO MIDDLEWARE)
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
        // console.log('User connected', socket.user)


        socket.on('user-message', async (messagePayload) => {
            /* 
            messagePayload:{
                chat:chatId, 
                content:'user message'
            }
             */
            console.log('Message from user:', messagePayload.content);



            //saving the user-message in db
            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                role: 'user',
                content: messagePayload.content
            })

            //getting the chat history 
            const chatHistory = await messageModel.find({ chat: messagePayload.chat });
            const chatHistoryWithRoleAndParts = chatHistory.map((item) => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            //getting the response from AI
            const aiResponse = await generateResponse(chatHistoryWithRoleAndParts);

            //saving the ai-response in db
            await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                role: 'model',
                content: aiResponse
            })
            socket.emit('ai-response', {
                content: aiResponse,
                chat: messagePayload.chat,
            });
        })

    });
}

module.exports = { initSocketServer }