"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    X,
    MapPin,
    Phone,
    Clock,
    CheckCircle2,
    Calendar,
    Utensils,
    Apple,
    ChevronDown,
    Filter,
    Search
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useLoader } from "@/app/LoaderProvider";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: string;
    deliveryAddress: string;
    customerNote?: string;
    createdAt: string;
    items: any[];
    user: any;
}

export default function OwnerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const { setIsLoading } = useLoader();

    // Filters
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/orders");
            setOrders(response.data);
            setFilteredOrders(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let result = [...orders];

        // Search
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.orderNumber.toLowerCase().includes(lowSearch) ||
                o.user.name.toLowerCase().includes(lowSearch) ||
                o.items.some(i => i.itemNameSnapshot.toLowerCase().includes(lowSearch))
            );
        }

        // Status
        if (statusFilter !== "ALL") {
            result = result.filter(o => o.status === statusFilter);
        }

        setFilteredOrders(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, orders]);

    const updateStatus = async (id: string, action: 'accept' | 'reject' | 'delivered') => {
        setIsLoading(true);
        try {
            const route = action === 'delivered' ? 'delivered' : action;
            await api.put(`/orders/${id}/${route}`);
            toast.success(`Order ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully`);
            fetchOrders();
        } catch (error: any) {
            toast.error(error.response?.data?.error || `Failed to ${action} order`);
        } finally {
            setIsLoading(false);
        }
    };

    // Pagination
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-text-main">Order Management</h1>
                        <p className="text-text-muted text-lg font-medium mt-1">Process incoming meals and prepare morning preorders.</p>
                    </div>

                    <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-fit">
                        {["ALL", "PENDING_ACCEPTANCE", "ACCEPTED", "DELIVERED"].map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                                    statusFilter === f ? "bg-white text-text-main shadow-lg" : "text-text-muted hover:text-text-main"
                                )}
                            >
                                {f.replace(/_/g, " ")}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative group w-full xl:w-80">
                    <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                    <input
                        placeholder="Search by ID, name or item..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-100 border-none h-14 pl-14 pr-6 rounded-[24px] font-bold text-sm text-text-main placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all w-full shadow-inner"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="popLayout">
                    {currentOrders.length === 0 ? (
                        <div className="card py-32 flex flex-col items-center justify-center text-center border-dashed">
                            <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center text-zinc-200 mb-6 transform -rotate-6">
                                <Clock size={40} />
                            </div>
                            <h3 className="text-xl font-black text-text-main">No orders found</h3>
                            <p className="text-text-muted font-medium mt-2 max-w-xs mx-auto">Either you are all caught up or try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {currentOrders.map((order) => {
                                const isFruit = order.items[0]?.menuItem?.type === "FRUIT";
                                return (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="card group overflow-hidden border-zinc-100"
                                    >
                                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-zinc-100">
                                            {/* Order Info */}
                                            <div className="p-8 lg:w-[35%] flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                                                            isFruit ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                                        )}>
                                                            {isFruit ? <Apple size={24} /> : <Utensils size={24} />}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black text-text-main tracking-tighter">#{order.orderNumber.slice(-8)}</h3>
                                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-0.5">
                                                                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-sm font-black text-white shadow-lg">
                                                                {order.user.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-black text-text-main leading-tight">{order.user.name}</p>
                                                                <p className="text-xs font-bold text-text-muted flex items-center gap-1.5 mt-0.5">
                                                                    <Phone size={12} className="text-brand-primary" /> {order.user.phone}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                                            <div className="flex gap-3 text-[11px] text-text-main font-bold">
                                                                <MapPin size={16} className="flex-shrink-0 text-brand-primary" />
                                                                <span className="leading-relaxed">{order.deliveryAddress}</span>
                                                            </div>
                                                        </div>

                                                        {order.customerNote && (
                                                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                                                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                                                    <Calendar size={12} /> Note to Kitchen
                                                                </p>
                                                                <p className="text-xs font-bold text-amber-900 leading-relaxed italic">
                                                                    "{order.customerNote}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Items List */}
                                            <div className="p-8 lg:w-[35%] bg-zinc-50/30">
                                                <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6 flex items-center justify-between">
                                                    <span>Order Items</span>
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider",
                                                        isFruit ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-orange-50 border-orange-100 text-orange-700"
                                                    )}>
                                                        {isFruit ? "PREORDER" : "COOKED MEAL"}
                                                    </span>
                                                </div>
                                                <div className="space-y-4">
                                                    {order.items.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center font-black text-[10px] text-brand-primary shadow-sm">
                                                                    {item.quantity}x
                                                                </span>
                                                                <span className="font-bold text-text-main">{item.itemNameSnapshot}</span>
                                                            </div>
                                                            <span className="font-black text-zinc-400">₹{item.priceSnapshot}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-6 border-t border-dashed border-zinc-200 mt-4 flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Grand Total</span>
                                                        <span className="text-2xl font-black text-brand-primary tracking-tighter">₹{order.totalAmount}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="p-8 lg:w-[30%] flex flex-col justify-center items-center gap-6 bg-zinc-50/50">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Live Status</p>
                                                    <div className={cn(
                                                        "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2.5",
                                                        order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                                                            order.status === "PENDING_ACCEPTANCE" ? "bg-amber-100 text-amber-800 border-amber-200" :
                                                                "bg-blue-100 text-blue-800 border-blue-200"
                                                    )}>
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full animate-pulse",
                                                            order.status === "DELIVERED" ? "bg-emerald-500" :
                                                                order.status === "PENDING_ACCEPTANCE" ? "bg-amber-500" : "bg-blue-500"
                                                        )} />
                                                        {order.status.replace(/_/g, " ")}
                                                    </div>
                                                </div>

                                                <div className="w-full space-y-3">
                                                    {order.status === "PENDING_ACCEPTANCE" ? (
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <button
                                                                onClick={() => updateStatus(order.id, 'accept')}
                                                                className="btn btn-primary w-full py-4 text-xs font-black shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                                                            >
                                                                <Check size={18} strokeWidth={3} /> Process Order
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(order.id, 'reject')}
                                                                className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-700 transition-colors py-2"
                                                            >
                                                                Reject Order
                                                            </button>
                                                        </div>
                                                    ) : order.status === "ACCEPTED" ? (
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'delivered')}
                                                            className="btn btn-primary w-full py-4 text-xs font-black shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle2 size={18} strokeWidth={3} /> Complete Delivery
                                                        </button>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-emerald-600">
                                                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                <CheckCircle2 size={24} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Order Completed</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-center gap-3 pt-3">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            order.paymentStatus === "PAID" ? "bg-emerald-500" : "bg-amber-500"
                                                        )} />
                                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                            Payment: {order.paymentStatus.replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 pt-10">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronDown className="rotate-90" size={20} />
                                    </button>
                                    <div className="flex gap-2">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl text-sm font-black transition-all",
                                                    currentPage === i + 1 ? "bg-brand-primary text-white shadow-lg" : "bg-zinc-100 text-text-muted hover:bg-zinc-200"
                                                )}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                    >
                                        <ChevronDown className="-rotate-90" size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

