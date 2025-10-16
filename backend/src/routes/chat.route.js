const express = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const { createChat, getChats, getMsg } = require('../controllers/chat.controller');
const chatRouter = express.Router();


// Get all chats for authenticated user
chatRouter.get('/', authUser, getChats);

// Create new chat
chatRouter.post('/', authUser, createChat);

//get all the messages for a chat 
chatRouter.get('/:chatId/messages', authUser, getMsg)


module.exports = chatRouter;