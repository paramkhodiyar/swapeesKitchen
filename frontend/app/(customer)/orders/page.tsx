"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Utensils,
    Clock,
    CheckCircle2,
    XCircle,
    Copy,
    Apple,
    ChevronRight,
    ShoppingBag,
    CreditCard,
    ArrowRight,
    Search,
    Filter
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
    items: any[];
    createdAt: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const { setIsLoading } = useLoader();
    const router = useRouter();

    // Filters
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/orders/my-orders");
            setOrders(response.data);
            setFilteredOrders(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            setIsLoading(false);
        }
    }, [setIsLoading]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        let result = [...orders];

        // Search
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.orderNumber.toLowerCase().includes(lowSearch) ||
                o.items.some(i => i.itemNameSnapshot.toLowerCase().includes(lowSearch))
            );
        }

        // Status Filter
        if (statusFilter === "PENDING") {
            result = result.filter(o => o.status === "PENDING_ACCEPTANCE" || (o.status === "ACCEPTED" && o.paymentStatus !== "PAID"));
        } else if (statusFilter === "PAID") {
            result = result.filter(o => o.paymentStatus === "PAID");
        }

        setFilteredOrders(result);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, orders]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "PENDING_ACCEPTANCE":
                return { label: "Pending Acceptance", color: "bg-amber-100 text-amber-700", icon: Clock };
            case "ACCEPTED":
                return { label: "Accepted", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 };
            case "DELIVERED":
                return { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };
            case "CANCELLED_BY_OWNER":
            case "CANCELLED_BY_CUSTOMER":
                return { label: "Cancelled", color: "bg-rose-100 text-rose-700", icon: XCircle };
            default:
                return { label: status, color: "bg-zinc-100 text-zinc-700", icon: Clock };
        }
    };

    const handleCopy = (num: string) => {
        navigator.clipboard.writeText(num);
        toast.success("Order number copied");
    };

    // Pagination
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter text-text-main">Order History</h1>
                        <p className="text-text-muted text-lg font-medium mt-1">Review your recent kitchen requests and preorders.</p>
                    </div>

                    <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-fit">
                        {(["ALL", "PENDING", "PAID"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === f ? "bg-white text-text-main shadow-lg" : "text-text-muted hover:text-text-main"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative group w-full xl:w-72">
                    <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                    <input
                        placeholder="Search orders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-100 border-none h-14 pl-14 pr-6 rounded-[24px] font-bold text-sm text-text-main placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all w-full shadow-inner"
                    />
                </div>
            </header>

            {orders.length === 0 ? (
                <div className="card py-32 flex flex-col items-center justify-center text-center px-6 border-zinc-100">
                    <div className="w-24 h-24 bg-zinc-50 rounded-[40px] flex items-center justify-center mb-8 text-zinc-200 transform rotate-12">
                        <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-text-main mb-3">No orders found</h2>
                    <p className="text-text-muted mb-10 max-w-xs font-medium italic">Our kitchen is waiting for your first order!</p>
                    <button onClick={() => router.push("/menu")} className="btn btn-primary px-10 py-5 shadow-2xl shadow-brand-primary/20">
                        Explore Our Menu
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    <AnimatePresence mode="popLayout">
                        {currentOrders.length === 0 ? (
                            <div className="card py-20 flex flex-col items-center justify-center text-zinc-300 border-dashed">
                                <Search size={40} className="mb-4 opacity-10" />
                                <p className="font-bold text-text-muted text-sm uppercase tracking-widest">No matching orders</p>
                            </div>
                        ) : (
                            currentOrders.map((order) => {
                                const firstItem = order.items[0];
                                const isFruit = firstItem?.menuItem?.type === "FRUIT";
                                const status = getStatusInfo(order.status);
                                const StatusIcon = status.icon;

                                return (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.3 }}
                                        className="card group hover:border-brand-primary/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 border-zinc-100"
                                    >
                                        <div className="p-8">
                                            <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                                                        isFruit ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                                                    )}>
                                                        {isFruit ? <Apple size={28} /> : <Utensils size={28} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1.5">
                                                            <span className="text-[11px] font-black text-text-muted hover:text-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-widest" onClick={() => handleCopy(order.id)}>
                                                                #{order.orderNumber.slice(-8)} <Copy size={14} className="opacity-50" />
                                                            </span>
                                                            <span className={cn(
                                                                "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border shadow-sm",
                                                                isFruit ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-orange-50 text-orange-700 border-orange-100"
                                                            )}>
                                                                {isFruit ? "Fruit Preorder" : "Main Meal"}
                                                            </span>
                                                        </div>
                                                        <div className="text-base font-black text-text-main flex items-center gap-2">
                                                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                            <div className="w-1 h-1 rounded-full bg-zinc-300" />
                                                            <span className="text-text-muted font-bold text-xs">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={cn("flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border shadow-sm", status.color)}>
                                                    <StatusIcon size={16} strokeWidth={3} />
                                                    {status.label}
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-8 bg-zinc-50/50 p-6 rounded-[24px] border border-zinc-100">
                                                {order.items.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <span className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center font-black text-xs text-brand-primary shadow-sm">
                                                                {item.quantity}x
                                                            </span>
                                                            <span className="font-bold text-text-main">{item.itemNameSnapshot}</span>
                                                        </div>
                                                        <span className="font-black text-zinc-500">₹{Number(item.subtotal).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap items-end justify-between gap-8 pt-8 border-t border-zinc-100">
                                                <div className="flex gap-12">
                                                    <div>
                                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Payment Status</p>
                                                        <div className={cn(
                                                            "inline-flex items-center gap-2.5 font-black text-sm uppercase tracking-wide px-3 py-1 rounded-lg",
                                                            order.paymentStatus === "PAID" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                                                        )}>
                                                            {order.paymentStatus === "PAID" ? (
                                                                <><CheckCircle2 size={18} strokeWidth={3} /> Success</>
                                                            ) : (
                                                                <><Clock size={18} strokeWidth={3} /> {order.paymentStatus.replace(/_/g, " ")}</>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="max-w-[200px]">
                                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Delivery To</p>
                                                        <p className="text-sm font-bold text-text-main line-clamp-1">{order.deliveryAddress}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1.5 leading-none">Order Total</p>
                                                    <p className="text-4xl font-black text-brand-primary tracking-tighter leading-none">₹{Number(order.totalAmount).toFixed(2)}</p>
                                                </div>
                                            </div>

                                            {/* Action Button for Payment */}
                                            {order.status === "ACCEPTED" && order.paymentStatus === "PAYMENT_PENDING" && (
                                                <button
                                                    onClick={() => router.push(`/payment?orderId=${order.id}&amount=${order.totalAmount}`)}
                                                    className="btn btn-primary w-full mt-10 py-5 rounded-[24px] font-black text-lg shadow-2xl shadow-brand-primary/20 flex items-center justify-center group"
                                                >
                                                    <CreditCard size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                                                    Complete Secure Payment
                                                    <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-10">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                            >
                                <ChevronRight className="rotate-180" size={20} />
                            </button>
                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl font-black transition-all",
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
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

