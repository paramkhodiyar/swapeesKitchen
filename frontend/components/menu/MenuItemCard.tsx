"use client";

import React from "react";
import { Plus, Minus, ShoppingCart, Info, Check } from "lucide-react";
import { useCartStore, ItemType } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

import { useSettingsStore } from "@/store/useSettingsStore";
import toast from "react-hot-toast";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number | string;
    type: ItemType;
    category?: string;
    imageUrl?: string;
    isOutOfStock: boolean;
}

export default function MenuItemCard({ item }: { item: MenuItem }) {
    const { addItem, updateQuantity, items: cartItems } = useCartStore();
    const { isOnline, offlineMessage, contactNumber } = useSettingsStore();

    const isInCart = cartItems.some(i => i.menuItemId === item.id);
    const cartItem = cartItems.find(i => i.menuItemId === item.id);

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isOnline) {
            toast.error(`${offlineMessage} Contact: ${contactNumber}`);
            return;
        }
        if (item.isOutOfStock) return;
        addItem(item);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        updateQuantity(item.id, 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        updateQuantity(item.id, -1);
    };

    return (
        <div className={cn(
            "card group flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/5",
            (item.isOutOfStock || !isOnline) && "opacity-75 grayscale-[0.3]",
            !isOnline && "pointer-events-none cursor-not-allowed"
        )}>
            {/* Image Section */}
            <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-zinc-100">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <ShoppingCart size={48} strokeWidth={1} />
                    </div>
                )}

                {item.isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-white/90 text-black text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                            Sold Out
                        </span>
                    </div>
                )}

                {item.type === "FRUIT" && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Plus size={10} strokeWidth={3} /> Preorder
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 p-4 md:p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 block">
                            {item.category || "General"}
                        </span>
                        <h3 className="font-bold text-lg text-text-main line-clamp-1">{item.name}</h3>
                    </div>
                </div>

                <p className="text-sm text-text-muted mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {item.description || "Freshly prepared with love at Swapee's Kitchen."}
                </p>

                <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5">Price</span>
                        <span className="font-black text-xl text-text-main">
                            <span className="text-sm font-bold mr-0.5">₹</span>
                            {Number(item.price)}
                        </span>
                    </div>

                    {isInCart ? (
                        <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 shadow-inner">
                            <button
                                onClick={handleDecrement}
                                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-text-main transition-all active:scale-90"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-8 text-center text-sm font-black text-text-main translate-y-[1px]">{cartItem?.quantity}</span>
                            <button
                                onClick={handleIncrement}
                                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white text-text-main transition-all active:scale-90"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAdd}
                            disabled={item.isOutOfStock}
                            className={cn(
                                "flex items-center justify-center gap-2 px-5 h-11 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95",
                                "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/30",
                                item.isOutOfStock && "bg-zinc-200 text-zinc-400 shadow-none pointer-events-none"
                            )}
                        >
                            <Plus size={18} strokeWidth={3} />
                            <span>Add</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
