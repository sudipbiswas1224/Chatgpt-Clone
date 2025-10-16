const userModel = require("../models/user.model");
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

// register controller
async function registerController(req, res) {
    const { email, fullName: { firstName, lastName }, password } = req.body;


    //check if user already exists or not
    const userAlreadyExists = await userModel.findOne({
        email
    })

    if (userAlreadyExists) {
        res.status(400).json({
            message: "User already exists"
        })
    }

    //create the user 
    const user = await userModel.create({
        fullName: {
            firstName, lastName
        },
        email,
        password: await bcryptjs.hash(password, 10)

    })

    //generating token for the user 
    const secretkey = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user._id }, secretkey);


    //sharing the token with cookie
    res.cookie("token", token);
    res.status(201).json({
        message: "User registered successfully",
        email: user.email,
        _id: user._id,
        firstname: firstName,
        lastname: lastName
    })
}


/* login controller */
async function loginController(req, res) {
    const { email, password } = req.body;

    //check if the email exist
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(404).json({
            message: "Invalid email or password"
        })
    }

    //check if the password is correct
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    //generating token for the user
    const secretkey = process.env.JWT_SECRET;
    const token = jwt.sign({ userId: user._id }, secretkey);

    //sharing the token with cookie
    res.cookie("token", token);
    res.status(200).json({
        message: "User logged in successfully",
        email: user.email
    })
}

async function logoutController(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        })

        res.status(200).json({
            message: 'Logged out successfully'
        })
    } catch (error) {
        console.log('Error in logout', error);
        res.status(500).json({
            message: 'Internal server error'
        })
    }


}


module.exports = { registerController, loginController, logoutController }