const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const chatRoutes = require('./routes/chat.route');


// using middlewares
const app = express();

// CORS: allow frontend origin and credentials (cookies)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

//using the routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);





module.exports = app;