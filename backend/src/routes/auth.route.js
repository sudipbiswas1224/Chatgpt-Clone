const express = require('express');
const { registerController, loginController } = require('../controllers/auth.controller');


const authRouter = express.Router()

//define routes
authRouter.post('/register', registerController)
authRouter.post('/login', loginController)


module.exports = authRouter;