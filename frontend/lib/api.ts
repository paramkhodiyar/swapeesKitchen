import axios from 'axios';

const mode = process.env.NEXT_PUBLIC_MODE;
const publicUrl = process.env.NEXT_PUBLIC_URL;
const localUrl = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: (mode === "development" || mode === "developement") ? localUrl : (publicUrl ? `${publicUrl}/api` : localUrl),
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
