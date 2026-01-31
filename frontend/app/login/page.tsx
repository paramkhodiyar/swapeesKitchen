"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, MessageSquare, ArrowRight, Loader2, ChevronRight, ChefHat } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
    const [otpStep, setOtpStep] = useState<"phone" | "verify">("phone");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { setToken, setUser } = useAuthStore();

    const handleLoginSuccess = (token: string, user: any) => {
        setToken(token);
        setUser(user);
        toast.success(`Welcome back, ${user.name || 'User'}!`);

        if (user.role === "OWNER") {
            router.push("/owner/dashboard");
        } else {
            router.push("/menu");
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone || !password) return toast.error("Please fill all fields");

        setIsLoading(true);
        try {
            const response = await api.post("/auth/login", { phone, password });
            handleLoginSuccess(response.data.token, response.data.user);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const requestOtp = async () => {
        if (!phone) return toast.error("Phone number is required");
        setIsLoading(true);
        try {
            await api.post("/auth/otp/request", { phone });
            toast.success("OTP sent successfully");
            setOtpStep("verify");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return toast.error("Please enter the OTP");

        setIsLoading(true);
        try {
            const response = await api.post("/auth/otp/verify", { phone, otp });
            handleLoginSuccess(response.data.token, response.data.user);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const adminLoginPreset = () => {
        setPhone("9999999999");
        setPassword("admin123");
    };

    const customerLoginPreset = () => {
        setPhone("8888888888");
        setPassword("user123");
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
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-text-main mb-2">Welcome Back</h2>
                    <p className="text-text-muted font-medium text-sm">Please enter your details to sign in.</p>
                </div>

                <div className="flex bg-zinc-100 p-1 rounded-2xl mb-8">
                    <button
                        onClick={() => setLoginMethod("password")}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            loginMethod === "password" ? "bg-white text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
                        )}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => setLoginMethod("otp")}
                        className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            loginMethod === "otp" ? "bg-white text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
                        )}
                    >
                        One-Time PIN
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {loginMethod === "password" ? (
                        <motion.form
                            key="pw-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onSubmit={handlePasswordLogin}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                                    <input
                                        type="tel"
                                        className="input-field pl-12"
                                        placeholder="9999999999"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                                    <input
                                        type="password"
                                        className="input-field pl-12"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button disabled={isLoading} className="btn btn-primary w-full py-4 mt-2">
                                {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="otp-form"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            {otpStep === "phone" ? (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" />
                                            <input
                                                type="tel"
                                                className="input-field pl-12"
                                                placeholder="9999999999"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button onClick={requestOtp} disabled={isLoading} className="btn btn-primary w-full py-4 mt-2">
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Send Code <ArrowRight size={18} className="ml-1" /></>}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={verifyOtp} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1 text-center block">Enter 6-digit Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="input-field text-center text-2xl tracking-[0.5em] font-black py-4"
                                                placeholder="000000"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button disabled={isLoading} className="btn btn-primary w-full py-4 mt-2">
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Verify & Sign In"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOtpStep("phone")}
                                        className="w-full text-center text-xs font-bold text-text-muted hover:text-brand-primary transition-colors uppercase tracking-widest"
                                    >
                                        Use Different Number
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-10 pt-8 border-t border-zinc-100 space-y-4">
                    <p className="text-center text-sm font-medium text-text-muted">
                        New to Swapee's Kitchen? <Link href="/signup" className="text-brand-primary font-bold hover:underline underline-offset-4">Create an account</Link>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={adminLoginPreset} className="btn btn-secondary py-2.5 text-[11px] font-black uppercase tracking-widest">Demo Owner</button>
                        <button onClick={customerLoginPreset} className="btn btn-secondary py-2.5 text-[11px] font-black uppercase tracking-widest">Demo Customer</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
