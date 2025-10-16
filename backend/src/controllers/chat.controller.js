const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

// Get all chats for the authenticated user
async function getChats(req, res) {
    try {
        const user = req.user;

        // Find all chats for this user, sorted by most recent activity first
        const chats = await chatModel
            .find({ user: user._id })
            .sort({ lastActivity: -1 })
            .select('_id title lastActivity createdAt updatedAt')
            .lean();

        res.status(200).json({
            success: true,
            chats
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chats'
        });
    }
}

// Create a new chat
async function createChat(req, res) {
    try {
        const { title } = req.body;
        const user = req.user;

        const chat = await chatModel.create({
            user: user._id,
            title
        });

        res.status(201).json({
            message: "Chat created successfully",
            chat: {
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity,
                user: chat.user,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            }
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create chat'
        });
    }
}

async function getMsg(req, res){
    try {
        const chatId = req.params.chatId;
        const messages = await messageModel.find({
            
            chat: chatId
        }).sort({updatedAt: 1})

        res.status(200).json({
            success: true, 
            messages,
            message:"Messages fetched successfully"
        })
    } catch (error) {
        console.log("Error in fetching the messages", error);
        res.status(500).json({
            success: false,
            message: "failed to fetch the messages"
        })
    }
}



module.exports = { createChat, getChats, getMsg };