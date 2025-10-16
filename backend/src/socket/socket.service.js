const { createServer } = require("http");
const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");








function initSocketServer(httpServer) {
    const io = new Server(httpServer, 
        {
            cors: {
                origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
                methods: ["GET", "POST"],
                credentials: true
            }
        }
    );

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

            //saving the user-message in db and creating the user-message-vector
            const [userMessage, userMessageVector] = await Promise.all([
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    role: 'user',
                    content: messagePayload.content
                }),
                generateVector(messagePayload.content)

            ])
            console.log('User messaged save in DB and vector generated');



            //getting the memory and chatHistory in parallel
            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: userMessageVector,
                    limit: 3,
                    metadata: {
                        chat: messagePayload.chat,
                        user: socket.user._id
                    }

                }),
                messageModel.find({ chat: messagePayload.chat }).sort({ createdAt: -1 }).limit(20).lean()

            ])
            console.log('vector memory and chat history fetched', memory);

            //getting the ltm from the memory
            const ltm = [
                {
                    role: 'user',
                    parts: [{
                        text: `
                            Here is some relevent previous conversation you had:
                            ${memory.map(item => item.metadata.text).join('\n')}
                        `
                    }]
                }
            ]
            console.log("LTM", ltm[0]);
            console.log('LTM created')

            //getting the role and parts only from chatHistory
            const stm = chatHistory.reverse().map((item) => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })
            console.log("STM created");
            console.log(stm);

            //getting the response from AI
            const aiResponse = await generateResponse([...ltm, ...stm]);
            console.log("AI response generated");

            //sending the airesponse to client
            socket.emit('ai-response', {
                content: aiResponse,
                chat: messagePayload.chat,
            });
            console.log('ai response sent to client');

            //saving the user-message-vector, saving ai-response in db, and creating ai-response-vector

            const [userMemoryResult, responseMessage, aiResponseVector] = await Promise.all([
                createMemory({
                    messageId: userMessage._id,
                    vector: userMessageVector,
                    metadata: {
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        text: messagePayload.content,
                    }
                }),
                messageModel.create({
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    role: 'model',
                    content: aiResponse
                }),
                generateVector(aiResponse)

            ])
            console.log('user-message-vector stored, ai-response saved in db, ai-response-vector generated');

            //storing the response vector in pinecone
            await createMemory({
                messageId: responseMessage._id,
                vector: aiResponseVector,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user._id,
                    text: aiResponse
                }
            })
            console.log('aiResponseVector stored in Pinecone');


        })

    });
}

module.exports = { initSocketServer }