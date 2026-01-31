"use client";

import React, { useEffect, useState } from "react";
import MenuItemCard from "@/components/menu/MenuItemCard";
import api from "@/lib/api";
import { useLoader } from "@/app/LoaderProvider";
import { Apple, Clock, AlertTriangle, CheckCircle2, Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function FruitsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [isPastCutoff, setIsPastCutoff] = useState(false);
    const { setIsLoading } = useLoader();

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name-asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const checkCutoff = () => {
        const now = new Date();
        const hour = now.getHours();
        // Cutoff at 11:00 PM (23:00)
        setIsPastCutoff(hour >= 23);
    };

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/menu");
            const fruitItems = response.data.filter((item: any) => item.type === "FRUIT");
            setItems(fruitItems);
            setFilteredItems(fruitItems);
        } catch (error) {
            console.error("Failed to fetch fruits", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        checkCutoff();
        const timer = setInterval(checkCutoff, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let result = [...items];

        if (searchTerm) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        result.sort((a, b) => {
            if (sortBy === "price-low") return Number(a.price) - Number(b.price);
            if (sortBy === "price-high") return Number(b.price) - Number(a.price);
            if (sortBy === "name-asc") return a.name.localeCompare(b.name);
            return 0;
        });

        setFilteredItems(result);
        setCurrentPage(1);
    }, [searchTerm, sortBy, items]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            <header className="space-y-8">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 text-brand-primary">
                            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center shadow-sm">
                                <Apple size={32} />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black tracking-tighter text-text-main">Fresh Fruits</h1>
                                <p className="text-text-muted text-lg font-medium">Farm-fresh preorder for next-day morning delivery.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group w-full sm:w-64">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                placeholder="Search fruits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-zinc-100 border-none h-14 pl-12 pr-6 rounded-[24px] font-bold text-sm text-text-main placeholder:text-zinc-400 focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all w-full"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-14 bg-zinc-100 border-none rounded-[24px] px-6 font-bold text-sm text-text-main outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
                        >
                            <option value="name-asc">Sort: A to Z</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Status Banner */}
                <div className={cn(
                    "flex items-start gap-4 p-6 rounded-[32px] border transition-all duration-300 shadow-sm",
                    isPastCutoff
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-emerald-50 border-emerald-200 text-emerald-800"
                )}>
                    <div className={cn(
                        "mt-0.5 p-3 rounded-2xl",
                        isPastCutoff ? "bg-amber-200/50" : "bg-emerald-200/50"
                    )}>
                        {isPastCutoff ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-sm uppercase tracking-widest mb-1">
                            {isPastCutoff ? "Cutoff Passed" : "Accepting Preorders"}
                        </h3>
                        <p className="text-sm font-medium opacity-90 leading-relaxed">
                            {isPastCutoff
                                ? "Orders placed after 11:00 PM will be processed for the day after tomorrow."
                                : "Order before 11:00 PM today for fresh doorstep delivery tomorrow morning."}
                        </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-2xl border border-current/10">
                            <Clock size={16} />
                            <span className="text-xs font-black uppercase tracking-widest">11:00 PM</span>
                        </div>
                        <p className="text-[10px] font-black uppercase opacity-40">Daily Cutoff</p>
                    </div>
                </div>
            </header>

            {currentItems.length > 0 ? (
                <div className="space-y-12">
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        <AnimatePresence mode="popLayout">
                            {currentItems.map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <MenuItemCard
                                        item={{
                                            ...item,
                                            isOutOfStock: item.isOutOfStock || isPastCutoff
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 pt-10">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary hover:text-white transition-all"
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
                                            currentPage === i + 1 ? "bg-brand-primary text-white" : "bg-zinc-100 text-text-muted hover:bg-zinc-200"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-main disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center text-text-muted">
                    <Apple size={48} className="mb-4 opacity-20" />
                    <h3 className="text-2xl font-black text-text-main">No fruits found</h3>
                    <p className="text-text-muted font-medium mt-2 max-w-xs mx-auto">Try adjusting your filters or search term.</p>
                </div>
            )}
        </div>
    );
}

