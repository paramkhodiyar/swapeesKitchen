import { create } from 'zustand';
import api from '../lib/api';
import toast from 'react-hot-toast';

export type ItemType = 'FOOD' | 'FRUIT';

interface CartItem {
    id: string;
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    type: ItemType;
    imageUrl?: string;
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    fetchCart: () => Promise<void>;
    addItem: (menuItem: any) => Promise<void>;
    updateQuantity: (menuItemId: string, delta: number) => Promise<void>;
    clearCart: () => void;
    totalAmount: () => number;
    cartType: () => ItemType | null;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    isLoading: false,
    fetchCart: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;

        set({ isLoading: true });
        try {
            const response = await api.get('/cart');
            const items = response.data.map((item: any) => ({
                id: item.id,
                menuItemId: item.menuItemId,
                name: item.menuItem.name,
                price: Number(item.priceSnapshot),
                quantity: item.quantity,
                type: item.menuItem.type,
                imageUrl: item.menuItem.imageUrl,
            }));
            set({ items });
        } catch (error) {
            console.error('Fetch cart failed', error);
        } finally {
            set({ isLoading: false });
        }
    },
    addItem: async (menuItem) => {
        try {
            await api.post('/cart', { menuItemId: menuItem.id, quantity: 1 });
            toast.success(`${menuItem.name} added to cart`);
            get().fetchCart();
        } catch (error: any) {
            const message = error.response?.data?.error || 'Failed to add item';
            toast.error(message);
        }
    },
    updateQuantity: async (menuItemId, delta) => {
        const items = get().items;
        const item = items.find((i) => i.menuItemId === menuItemId);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        const oldItems = [...items];

        // Optimistic Update
        if (newQuantity <= 0) {
            set({ items: items.filter(i => i.menuItemId !== menuItemId) });
        } else {
            set({ items: items.map(i => i.menuItemId === menuItemId ? { ...i, quantity: newQuantity } : i) });
        }

        try {
            if (newQuantity <= 0) {
                await api.delete(`/cart/${item.id}`);
            } else {
                await api.put(`/cart/${item.id}`, { quantity: newQuantity });
            }
        } catch (error) {
            console.error('Update cart failed', error);
            set({ items: oldItems });
            toast.error('Failed to update quantity');
        }
    },
    clearCart: () => set({ items: [] }),
    totalAmount: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    cartType: () => {
        const types = new Set(get().items.map(i => i.type));
        if (types.size > 1) return 'FOOD'; // prioritize food flow for mixed? or return null
        return get().items[0]?.type || null;
    },
}));
