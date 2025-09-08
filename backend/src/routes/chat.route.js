const express = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const { createChat } = require('../controllers/chat.controller');
const chatRouter = express.Router();


//create chat routes
chatRouter.post('/',authUser,createChat)


module.exports = chatRouter;