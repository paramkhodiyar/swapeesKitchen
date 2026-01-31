"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Phone, Clock, ArrowRight } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function OfflineModal() {
    const { isOnline, offlineMessage, contactNumber } = useSettingsStore();
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // If kitchen goes offline, show modal if not already shown this session 
        // and only on Business pages (Menu/Fruits)
        const hasSeenModal = sessionStorage.getItem("hasSeenOfflineModal");
        const isBusinessPage = pathname === "/menu" || pathname === "/fruits";

        if (!isOnline && !hasSeenModal && isBusinessPage) {
            setIsOpen(true);
            sessionStorage.setItem("hasSeenOfflineModal", "true");
        }

        // Reset if kitchen comes back online
        if (isOnline) {
            sessionStorage.removeItem("hasSeenOfflineModal");
            setIsOpen(false);
        }
    }, [isOnline]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-text-main transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-10 text-center">
                            <div className="w-20 h-20 rounded-[32px] bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <AlertCircle size={40} strokeWidth={1.5} />
                            </div>

                            <h2 className="text-3xl font-black text-text-main tracking-tighter mb-4">Kitchen is Offline</h2>
                            <p className="text-text-muted font-medium text-lg leading-relaxed mb-10">
                                {offlineMessage}
                            </p>

                            <div className="grid gap-4 mb-10 text-left">
                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-zinc-50 border border-zinc-100 group">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Direct Support</p>
                                        <p className="text-lg font-black text-text-main">{contactNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full btn btn-primary py-5 rounded-3xl text-lg font-black shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                            >
                                Continue Browsing <ArrowRight size={22} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
