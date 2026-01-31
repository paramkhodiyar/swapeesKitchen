"use client";

import React, { useEffect, useState } from "react";
import {
    Search,
    User,
    Phone,
    Mail,
    ExternalLink,
    ShoppingBag,
    History,
    Star,
    ChevronRight,
    Users,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useLoader } from "@/app/LoaderProvider";

export default function OwnerCustomersPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [customers, setCustomers] = useState<any[]>([]);
    const { setIsLoading } = useLoader();
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/users");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setCustomers(response.data.filter((u: any) => u.role === "CUSTOMER"));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load directory");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-text-main">Customer Directory</h1>
                    <p className="text-text-muted text-sm font-medium">Manage and understand your loyal kitchen community.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-2xl border border-brand-primary/10 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <Users size={16} />
                        {customers.length} Total Customers
                    </div>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="relative flex-1 group">
                    <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                    <input
                        className="w-full bg-zinc-100 border-none h-16 pl-14 pr-6 rounded-[24px] font-bold text-text-main placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                        placeholder="Search by name, phone or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="h-16 px-8 rounded-[24px] bg-zinc-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredCustomers.map((customer, idx) => (
                        <motion.div
                            key={customer.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card group hover:border-brand-primary/30 transition-all duration-300"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-muted group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                                        <User size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-lg text-text-main truncate leading-tight">{customer.name}</h3>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Added {new Date(customer.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                                            <Phone size={14} />
                                        </div>
                                        <span className="font-bold text-text-main">{customer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm opacity-60">
                                        <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400">
                                            <Mail size={14} />
                                        </div>
                                        <span className="font-bold text-text-main truncate">Not Provided</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Total Orders</span>
                                        <span className="text-xl font-black text-brand-primary">{customer._count?.orders || 0}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Status</span>
                                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-zinc-200 text-text-main font-bold text-xs uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all">
                                    View Full History <ChevronRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredCustomers.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-zinc-50 rounded-[32px] flex items-center justify-center text-zinc-200 mx-auto transform rotate-6">
                        <Users size={40} />
                    </div>
                    <h3 className="text-xl font-black text-text-main">No customers found</h3>
                    <p className="text-text-muted font-medium">Try searching with a different name or phone number.</p>
                </div>
            )}
        </div>
    );
}
