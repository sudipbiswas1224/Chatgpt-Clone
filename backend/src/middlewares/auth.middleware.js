const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');


async function authUser(req, res, next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).send('Unauthorized');
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({_id:decoded.userId});
        if(!user){
            return res.status(401).send('Unauthorized');
        }
        req.user = user;
        next();
    }
    catch(err){
        return res.status(401).send('Unauthorized');
    }
}

module.exports = {authUser};