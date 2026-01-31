import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface KitchenSettings {
    isOnline: boolean;
    offlineMessage: string;
    contactNumber: string;
    toggleOnline: () => void;
    setOfflineMessage: (msg: string) => void;
}

export const useSettingsStore = create<KitchenSettings>()(
    persist(
        (set) => ({
            isOnline: true,
            offlineMessage: "Our kitchen is currently offline. We'll be back soon with fresh meals!",
            contactNumber: "+91 9876543210",
            toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),
            setOfflineMessage: (msg) => set({ offlineMessage: msg }),
        }),
        {
            name: 'kitchen-settings',
        }
    )
);
