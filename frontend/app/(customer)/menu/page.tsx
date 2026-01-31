"use client";

import React, { useEffect, useState } from "react";
import MenuItemCard from "@/components/menu/MenuItemCard";
import api from "@/lib/api";
import { useLoader } from "@/app/LoaderProvider";
import { Utensils, Search, Filter, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MealsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const { setIsLoading } = useLoader();

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("name-asc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/menu");
            const foodItems = response.data.filter((item: any) => item.type === "FOOD");
            setItems(foodItems);
            setFilteredItems(foodItems);
        } catch (error) {
            console.error("Failed to fetch meals", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        let result = [...items];

        // Search
        if (searchTerm) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category
        if (selectedCategory !== "All") {
            result = result.filter(item => item.category === selectedCategory);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === "price-low") return Number(a.price) - Number(b.price);
            if (sortBy === "price-high") return Number(b.price) - Number(a.price);
            if (sortBy === "name-asc") return a.name.localeCompare(b.name);
            return 0;
        });

        setFilteredItems(result);
        setCurrentPage(1); // Reset to first page on filter change
    }, [searchTerm, selectedCategory, sortBy, items]);

    const categories = ["All", ...Array.from(new Set(items.map(i => i.category || "General")))];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
            <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm">
                            <Utensils size={32} />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black tracking-tighter text-text-main">Today's Batch</h1>
                            <p className="text-text-muted text-lg font-medium">Freshly prepared home-cooked goodness.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    selectedCategory === cat ? "bg-brand-primary text-white shadow-lg" : "bg-zinc-100 text-text-muted hover:bg-zinc-200"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-64">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            placeholder="Find a dish..."
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
                                    <MenuItemCard item={item} />
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
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-24 h-24 bg-zinc-50 rounded-[40px] flex items-center justify-center text-zinc-200 mb-6 transform rotate-3">
                        <Utensils size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-text-main">No dishes found</h3>
                    <p className="text-text-muted font-medium mt-2 max-w-xs mx-auto">Try adjusting your filters or search term to see what else we have.</p>
                </div>
            )}
        </div>
    );
}

