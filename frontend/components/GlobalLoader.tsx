"use client";

import { ChefHat } from "lucide-react";
import { useEffect, useState } from "react";

export default function GlobalLoader() {
    const [isVisible, setIsVisible] = useState(true);

    // This could be controlled by a global state, but for now it's a simple overlay
    // that could be triggered by navigation or API calls.
    // In a real app, you'd use a store (zustand/redux) to toggle this.

    // For demonstration, we'll let it show briefly on initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            // setIsVisible(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // We keep it as a component that can be rendered conditionally
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-hat text-brand-primary">
                    <ChefHat size={64} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-text-muted tracking-wide uppercase">Swapee's Kitchen</p>
            </div>
        </div>
    );
}
