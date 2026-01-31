"use client";

import React, { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useLoader } from "@/app/LoaderProvider";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    Info,
    ChevronLeft,
    Clock,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/api";

import { useSettingsStore } from "@/store/useSettingsStore";

export default function CartPage() {
    const { items, updateQuantity, totalAmount, fetchCart, clearCart } = useCartStore();
    const { isOnline, offlineMessage, contactNumber } = useSettingsStore();
    const { setIsLoading } = useLoader();
    const router = useRouter();

    const [addresses, setAddresses] = React.useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");
    const [customerNote, setCustomerNote] = React.useState("");

    const hasFood = items.some(i => i.type === "FOOD");
    const hasFruit = items.some(i => i.type === "FRUIT");

    useEffect(() => {
        fetchCart();
        fetchAddresses();
    }, [fetchCart]);

    const fetchAddresses = async () => {
        try {
            const res = await api.get("/users/addresses");
            setAddresses(res.data);
            const defaultAddr = res.data.find((a: any) => a.isDefault);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCheckout = async () => {
        if (!isOnline) {
            toast.error(`${offlineMessage} Contact: ${contactNumber}`);
            return;
        }
        if (items.length === 0) return;

        const selectedAddr = addresses.find(a => a.id === selectedAddressId);
        if (!selectedAddr) {
            toast.error("Please select a delivery address");
            return;
        }

        const fullAddress = `${selectedAddr.street}, ${selectedAddr.city}, ${selectedAddr.state} - ${selectedAddr.zip}`;

        setIsLoading(true);
        try {
            await api.post("/orders", {
                deliveryAddress: fullAddress,
                customerNote: customerNote.trim() || undefined
            });

            const response = await api.get("/orders/my-orders");
            const newOrders = response.data;
            clearCart();
            toast.success("Order(s) placed successfully!");

            // Logic: If any order needs payment (FRUIT part), redirect to payment
            const orderRequiringPayment = newOrders.find((o: any) => o.paymentStatus === "PAYMENT_PENDING");

            if (orderRequiringPayment) {
                router.push(`/payment?orderId=${orderRequiringPayment.id}&amount=${orderRequiringPayment.totalAmount}`);
            } else {
                router.push("/orders");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to place order");
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in px-6 text-center">
                <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-8 text-zinc-300">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-2xl font-black text-text-main mb-3">Your cart is empty</h2>
                <p className="text-text-muted mb-10 max-w-xs font-medium">
                    Looks like your kitchen is currently quiet. Add some delicious items to get started!
                </p>
                <Link href="/menu" className="btn btn-primary px-10 py-4 shadow-xl shadow-brand-primary/20">
                    Explore Menu
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            <header className="mb-10">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-text-muted hover:text-text-main transition-colors mb-4 text-xs font-bold uppercase tracking-widest"
                >
                    <ChevronLeft size={16} />
                    Continue Browsing
                </button>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <ShoppingBag size={24} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-text-main">Your Kitchen</h1>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Delivery Logic Explainer */}
                    {hasFood && (
                        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-brand-primary shadow-sm flex-shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-text-main">Cooked Meals (Fulfillment)</h4>
                                <p className="text-xs text-text-muted font-medium mt-0.5">These will be delivered as soon as the kitchen accepts and prepares them.</p>
                            </div>
                        </div>
                    )}

                    {hasFruit && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-emerald-900">Fresh Fruit Preorders</h4>
                                <p className="text-xs text-emerald-700 font-medium mt-0.5">Scheduled for delivery tomorrow morning. Payment is non-refundable once confirmed.</p>
                            </div>
                        </div>
                    )}

                    {/* Cart Items */}
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Items in Cart ({items.length})</div>
                        {items.map((item) => (
                            <div key={item.id} className="card p-4 flex gap-5 items-center group">
                                <div className="w-24 h-24 rounded-2xl bg-zinc-100 overflow-hidden flex-shrink-0 border border-zinc-100">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                            <ShoppingBag size={32} />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="mb-2">
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                                            item.type === "FRUIT" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-600"
                                        )}>
                                            {item.type}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-text-main truncate">{item.name}</h3>
                                    <p className="font-black text-brand-primary">₹{item.price}</p>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <div className="flex items-center bg-zinc-50 p-1 rounded-xl border border-zinc-200 shadow-inner">
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, -1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white text-text-main transition-all active:scale-90"
                                        >
                                            {item.quantity === 1 ? <Trash2 size={18} className="text-rose-500" /> : <Minus size={18} />}
                                        </button>
                                        <span className="w-8 text-center text-sm font-black text-text-main">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white text-text-main transition-all active:scale-90"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                        Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Address Selection */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted">Delivery Address</h3>
                            <Link href="/profile" className="text-[10px] font-black text-brand-primary hover:underline uppercase tracking-tighter">Manage</Link>
                        </div>
                        {addresses.length > 0 ? (
                            <select
                                value={selectedAddressId}
                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 font-bold text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none cursor-pointer"
                            >
                                {addresses.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.city}, {a.street}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <Link href="/profile" className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-zinc-200 text-text-muted hover:border-brand-primary hover:text-brand-primary transition-all">
                                <Plus size={18} />
                                <span className="font-bold text-sm">Add Address</span>
                            </Link>
                        )}
                    </div>

                    {/* Note to Kitchen */}
                    <div className="card p-6">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-text-muted mb-4">Note to Kitchen</h3>
                        <textarea
                            placeholder="Allergies, spiciness level, extra napkins..."
                            value={customerNote}
                            onChange={(e) => setCustomerNote(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 font-medium text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/20 min-h-[100px] resize-none placeholder:text-zinc-400"
                        />
                    </div>

                    <div className="card p-8 sticky top-8 shadow-2xl shadow-zinc-200/50">
                        <h2 className="text-xl font-black text-text-main mb-6">Total Summary</h2>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm font-medium text-text-muted uppercase tracking-wider">
                                <span>Cart Subtotal</span>
                                <span className="text-text-main">₹{totalAmount().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-text-muted uppercase tracking-wider">
                                <span>Handling Fee</span>
                                <span className="text-emerald-600">FREE</span>
                            </div>
                            <div className="pt-6 border-t border-zinc-100 flex justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Grand Total</span>
                                    <span className="text-3xl font-black text-brand-primary tracking-tighter">₹{totalAmount().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={!isOnline}
                            className={cn(
                                "btn btn-primary w-full py-5 rounded-3xl text-lg font-black shadow-2xl shadow-brand-primary/20 transition-all",
                                !isOnline ? "opacity-50 cursor-not-allowed grayscale" : "hover:scale-[1.02]"
                            )}
                        >
                            Confirm  Order
                            <ArrowRight size={24} className="ml-3" />
                        </button>

                        <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Secure Checkout</span>
                            </div>
                            <p className="text-[9px] text-text-muted font-medium leading-relaxed uppercase">
                                By placing the order, you agree to our terms of delivery and fulfillment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

