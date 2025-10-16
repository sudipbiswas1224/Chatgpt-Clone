import api from "./api";

const logoutApi = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
}

export default logoutApi;
