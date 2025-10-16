import axios from 'axios';

// Base axios instance with credentials for JWT cookies
const api = axios.create({
    baseURL: 'https://auriongpt.onrender.com/api',
    withCredentials: true, // Important: sends cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
