const { createServer } = require("http");
const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");








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
            const userMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                role: 'user',
                content: messagePayload.content
            })
            console.log("userMessage saved in DB");

            //generating the vector from the message
            const userMessageVector = await generateVector(messagePayload.content);
            console.log("userMessageVector generated");

            //getting the relevant contexrt form the pinecone
            const memory = await queryMemory({
                queryVector:userMessageVector,
                limit:3, 

            })
            console.log("Memory fetched from pinecone:", memory);

            //storing in pincone the userMessageVector
            await createMemory({
                messageId: userMessage._id,
                vector: userMessageVector,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id, 
                    text: messagePayload.content,
                }
            })
            console.log('userMessageVector stored in Pinecone');


            //getting the chat history (ONLY THE LAST 20 MSG)
            const chatHistory = (await messageModel.find({ chat: messagePayload.chat }).sort({ createdAt: -1 }).limit(20).lean()).reverse();
            console.log("problem lies here ");

            //getting the role and parts only from chatHistory
            const chatHistoryWithRoleAndParts = chatHistory.map((item) => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            //getting the response from AI
            const aiResponse = await generateResponse(chatHistoryWithRoleAndParts);
            console.log("AI response generated");

            //saving the ai-response in db
            const responseMessage = await messageModel.create({
                chat: messagePayload.chat,
                user: socket.user._id,
                role: 'model',
                content: aiResponse
            })
            console.log("aiResponse saved in DB");

            //getting the ai-response vector
            const aiResponseVector = await generateVector(aiResponse);
            console.log("aiResponseVector generated");

            //storing the response vector in pinecone
            await createMemory({
                messageId: responseMessage._id,
                vector: aiResponseVector,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: aiResponse                }
            })
            console.log('aiResponseVector stored in Pinecone');

            socket.emit('ai-response', {
                content: aiResponse,
                chat: messagePayload.chat,
            });
        })

    });
}

module.exports = { initSocketServer }