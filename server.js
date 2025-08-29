require('dotenv').config();
const app = require("./src/app");
const connectDb = require('./src/db/db');
const { initSocketServer } = require('./src/socket/socket.service');
const httpServer = require("http").createServer(app);


try {
    connectDb();
    initSocketServer(httpServer);
}catch(err){
    console.log("hi here is the error",err);
}


httpServer.listen(3000, () => {
    console.log('server is listening to port 3000');
})