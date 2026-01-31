import axios from 'axios';

const mode = process.env.NEXT_PUBLIC_MODE;
const publicUrl = process.env.NEXT_PULIC_URL; // Using the provided variable name with typo
const localUrl = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: mode === "developement" ? localUrl : `${publicUrl}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
