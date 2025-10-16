import api from './api';

/**
 * Create a new chat
 * @param {string} title - Chat title
 * @returns {Promise} - Returns created chat object
 */
export const createChatApi = async (title) => {
    try {
        const response = await api.post('/chat', { title });
        return response.data.chat; // Returns { _id, title, lastActivity, user }
    } catch (error) {
        console.error('Error creating chat:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Fetch all chats for the logged-in user
 * TODO: Add this endpoint to backend later
 */
export const fetchChatsApi = async () => {
    try {
        const response = await api.get('/chat');
        return response.data.chats;
    } catch (error) {
        console.error('Error fetching chats:', error.response?.data || error.message);
        throw error;
    }
};

export const fetchMessagesApi = async (chatId) => {
    try{
        const response = await api.get(`/chat/${chatId}/messages`,{
            withCredentials: true
        });
        console.log(response);
        return response.data;

    }
    catch(error){
        console.error("Error in fetching the messages", error);
        throw error;
    }
}
