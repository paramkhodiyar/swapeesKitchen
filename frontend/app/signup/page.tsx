"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, Lock, User, Loader2, ChefHat } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import Link from "next/link";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !password) return toast.error("Please fill all fields");

        setIsLoading(true);
        try {
            await api.post("/auth/register", { name, phone, password });
            toast.success("Account created successfully! Please login.");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="mb-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-xl shadow-brand-primary/20 mb-4">
                    <ChefHat size={32} />
                </div>
                <h1 className="text-3xl font-black tracking-tight text-text-main">Swapee's Kitchen</h1>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card w-full max-w-md p-8 sm:p-10"
            >
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-text-main mb-2">Create Account</h2>
                    <p className="text-text-muted font-medium text-sm">Join the community of home-cooked food lovers.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="text"
                                className="input-field pl-12"
                                placeholder="John Doe"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative group">
                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="tel"
                                className="input-field pl-12"
                                placeholder="9999999999"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 text-left">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                            <input
                                type="password"
                                className="input-field pl-12"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button disabled={isLoading} className="btn btn-primary w-full py-4 mt-4 shadow-xl shadow-brand-primary/20">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Create Account"}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-zinc-100">
                    <p className="text-center text-sm font-medium text-text-muted">
                        Already have an account? <Link href="/login" className="text-brand-primary font-bold hover:underline underline-offset-4">Sign in instead</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
