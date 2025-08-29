const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.route');
const chatRoutes = require('./routes/chat.route');


// using middlewares
const app = express();
app.use(express.json());
app.use(cookieParser());

//using the routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);





module.exports = app;