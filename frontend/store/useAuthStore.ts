import { create } from 'zustand';
import api from '../lib/api';
import Cookies from 'js-cookie';

interface User {
    id: string;
    name: string;
    phone: string;
    role: 'OWNER' | 'CUSTOMER';
    email?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
    fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: typeof window !== 'undefined' ? (Cookies.get('token') || localStorage.getItem('token')) : null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
            Cookies.set('token', token, { expires: 7 }); // Persist for 7 days
        } else {
            localStorage.removeItem('token');
            Cookies.remove('token');
        }
        set({ token });
    },
    logout: () => {
        localStorage.removeItem('token');
        Cookies.remove('token');
        set({ user: null, token: null });
    },
    fetchMe: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/auth/me');
            set({ user: response.data.user });
        } catch (error) {
            console.error('Fetch me failed', error);
            localStorage.removeItem('token');
            Cookies.remove('token');
            set({ user: null, token: null });
        } finally {
            set({ isLoading: false });
        }
    },
}));
