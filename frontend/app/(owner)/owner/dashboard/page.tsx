"use client";

import React, { useEffect, useState } from "react";
import {
    Clock,
    CheckCircle2,
    Utensils,
    Apple,
    TrendingUp,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
    Check,
    X,
    MessageSquare,
    Play,
    Power,
    CreditCard,
    ShoppingBag
} from "lucide-react";
import api from "@/lib/api";
import { useLoader } from "@/app/LoaderProvider";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function OwnerDashboard() {
    const [orders, setOrders] = useState([]);
    const { setIsLoading } = useLoader();
    const { isOnline, toggleOnline } = useSettingsStore();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/orders");
            setOrders(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to refresh orders");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (orderId: string, action: 'accept' | 'reject' | 'deliver') => {
        setIsLoading(true);
        try {
            let endpoint = '';
            if (action === 'accept') endpoint = `/orders/${orderId}/accept`;
            if (action === 'reject') endpoint = `/orders/${orderId}/reject`;
            if (action === 'deliver') endpoint = `/orders/${orderId}/delivered`;

            await api.put(endpoint);
            toast.success(`Order ${action}ed successfully`);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.error || `Failed to ${action} order`);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter logic for buckets
    const activeMeals = orders.filter((order: any) => {
        const firstItem = order.items[0];
        return firstItem?.menuItem?.type === "FOOD" &&
            !["DELIVERED", "CANCELLED_BY_OWNER", "CANCELLED_BY_CUSTOMER"].includes(order.status);
    });

    const pendingFruits = orders.filter((order: any) => {
        const firstItem = order.items[0];
        return firstItem?.menuItem?.type === "FRUIT" && order.status === "ACCEPTED";
    });

    // Calculate fruit quantities for procurement
    const fruitTotals: Record<string, number> = {};
    orders.forEach((order: any) => {
        const isFruitOrder = order.items.some((i: any) => i.menuItem?.type === "FRUIT");
        if (isFruitOrder && order.status === "ACCEPTED") {
            order.items.forEach((item: any) => {
                fruitTotals[item.itemNameSnapshot] = (fruitTotals[item.itemNameSnapshot] || 0) + item.quantity;
            });
        }
    });

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-text-main">Kitchen Overview</h1>
                    <p className="text-text-muted text-sm font-medium">Manage your daily operations and real-time requests.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleOnline}
                        className={cn(
                            "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl",
                            isOnline
                                ? "bg-emerald-500 text-white shadow-emerald-200"
                                : "bg-rose-500 text-white shadow-rose-200"
                        )}
                    >
                        <Power size={18} />
                        {isOnline ? "Kitchen is Online" : "Kitchen is Offline"}
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="bg-zinc-100 text-text-main hover:bg-zinc-200 w-12 h-12 flex items-center justify-center rounded-2xl transition-all"
                    >
                        <Clock size={20} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Bucket 1: Real-time Cooking (FOOD) */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-lg shadow-orange-100/50">
                                <Utensils size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight">Active Meals</h2>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Orders to be cooked now</p>
                            </div>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-black">
                            {activeMeals.length}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {activeMeals.length > 0 ? (
                                activeMeals.map((order: any) => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="card p-6 group hover:border-brand-primary/30 transition-all border-l-4 border-l-orange-500"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">#{order.orderNumber.slice(-8)}</span>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest",
                                                        order.status === "PENDING_ACCEPTANCE" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {order.status.replace(/_/g, " ")}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-text-main">
                                                    {order.items.map((i: any) => `${i.quantity}x ${i.itemNameSnapshot}`).join(", ")}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Customer</p>
                                                <p className="text-sm font-black text-text-main">{order.user.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
                                            <div className="flex items-center gap-4 text-rose-500 text-xs font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                                                <CreditCard size={14} />
                                                {order.paymentStatus === "PAID" ? "PAID" : "COD / PENDING"}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {order.status === "PENDING_ACCEPTANCE" ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(order.id, 'reject')}
                                                            className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-400 hover:bg-rose-100 hover:text-rose-600 transition-all flex items-center justify-center"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(order.id, 'accept')}
                                                            className="btn btn-primary px-6 h-10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                                                        >
                                                            <Check size={18} strokeWidth={3} /> Accept
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAction(order.id, 'deliver')}
                                                        className="bg-emerald-500 text-white px-6 h-10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                                                    >
                                                        <Check size={18} strokeWidth={3} /> Mark Delivered
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="card p-20 flex flex-col items-center justify-center border-dashed border-2 text-zinc-300"
                                >
                                    <Utensils size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No active meal orders</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Bucket 2: Procurement & Preorders (FRUIT) */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100/50">
                                <Apple size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight">Procurement</h2>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Stock for tomorrow's deliveries</p>
                            </div>
                        </div>
                    </div>

                    {/* Procurement Aggregate Card */}
                    <div className="card bg-zinc-900 text-white border-none p-8 shadow-2xl shadow-zinc-200 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-3">
                            <TrendingUp size={18} className="text-emerald-400" />
                            Procurement Master List
                        </h3>

                        <div className="grid gap-6">
                            {Object.entries(fruitTotals).length > 0 ? (
                                Object.entries(fruitTotals).map(([name, qty]) => (
                                    <div key={name} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                                            <span className="text-zinc-300 text-lg font-bold group-hover:text-white transition-colors">{name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="h-px w-16 bg-zinc-800" />
                                            <span className="text-2xl font-black text-emerald-400 min-w-[2rem] text-right">{qty}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-zinc-600 space-y-4">
                                    <ShoppingBag size={32} className="mx-auto opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No preorders to fulfill yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fruit Orders Detail */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest">Recent Preorders</h3>
                            <button className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        {pendingFruits.slice(0, 4).map((order: any) => (
                            <div key={order.id} className="card p-5 flex items-center justify-between border-l-4 border-l-emerald-500 group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-sm text-text-main truncate pr-4">
                                            {order.items.map((i: any) => `${i.quantity}x ${i.itemNameSnapshot}`).join(", ")}
                                        </h4>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">
                                            {order.user.name} • <span className={order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>{order.paymentStatus}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-xs font-black text-text-main">₹{order.totalAmount}</span>
                                    <ChevronRight size={16} className="text-zinc-300 group-hover:translate-x-1 group-hover:text-brand-primary transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
