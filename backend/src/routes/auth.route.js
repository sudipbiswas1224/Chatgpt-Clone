const express = require('express');
const { registerController, loginController, logoutController } = require('../controllers/auth.controller');


const authRouter = express.Router()

//define routes
authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.post('/logout', logoutController)


module.exports = authRouter;