const mongoose = require('mongoose')

async function connectDb(){
    try{
        mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to DB')
    }
    catch(err){
        console.error('Error connecting to MongoDB', err)
    }
}


module.exports = connectDb;