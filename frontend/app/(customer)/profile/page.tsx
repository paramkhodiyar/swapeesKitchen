"use client";

import React, { useEffect, useState } from "react";
import {
    User,
    Phone,
    Mail,
    MapPin,
    Settings,
    ChevronRight,
    LogOut,
    Shield,
    ShoppingBag,
    History,
    CreditCard,
    Bell,
    Plus,
    Trash2,
    X,
    Check,
    CreditCard as CardIcon,
    Wallet,
    Info
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useLoader } from "@/app/LoaderProvider";

interface Address {
    id: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
}

interface SavedPayment {
    id: string;
    type: "CARD" | "UPI";
    provider: string;
    identifier: string;
    isDefault: boolean;
}

export default function ProfilePage() {
    const { user, logout, fetchMe, isLoading } = useAuthStore();
    const { setIsLoading } = useLoader();
    const router = useRouter();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [payments, setPayments] = useState<SavedPayment[]>([]);
    const [activeTab, setActiveTab] = useState<"overview" | "addresses" | "payments">("overview");

    // Modals
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Form States
    const [addressForm, setAddressForm] = useState({
        street: "",
        city: "",
        state: "",
        zip: "",
        isDefault: false
    });

    const [paymentForm, setPaymentForm] = useState({
        type: "UPI" as "CARD" | "UPI",
        provider: "",
        identifier: "",
        isDefault: false
    });

    useEffect(() => {
        if (!user && !isLoading) {
            router.push("/login");
            toast.error("Please login to view your profile");
            return;
        }
        fetchMe();
        fetchAddresses();
        fetchPayments();
    }, [fetchMe, user, isLoading, router]);

    const fetchAddresses = async () => {
        try {
            const res = await api.get("/users/addresses");
            setAddresses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPayments = async () => {
        try {
            const res = await api.get("/users/payments");
            setPayments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
        toast.success("Logged out successfully");
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingAddress) {
                await api.put(`/users/addresses/${editingAddress.id}`, addressForm);
                toast.success("Address updated");
            } else {
                await api.post("/users/addresses", addressForm);
                toast.success("Address added");
            }
            fetchAddresses();
            setIsAddressModalOpen(false);
            setEditingAddress(null);
            setAddressForm({ street: "", city: "", state: "", zip: "", isDefault: false });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save address");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/users/addresses/${id}`);
            toast.success("Address deleted");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to delete address");
        }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post("/users/payments", paymentForm);
            toast.success("Payment method saved");
            fetchPayments();
            setIsPaymentModalOpen(false);
            setPaymentForm({ type: "UPI", provider: "", identifier: "", isDefault: false });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to save payment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePayment = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/users/payments/${id}`);
            toast.success("Payment method removed");
            fetchPayments();
        } catch (err) {
            toast.error("Failed to remove payment");
        }
    };

    if (!user) return null;

    const navItems = [
        { id: "overview", label: "Overview", icon: User },
        { id: "addresses", label: "Addresses", icon: MapPin },
        { id: "payments", label: "Payments", icon: CreditCard },
    ];

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fade-in">
            <header className="mb-10 lg:mb-16">
                <h1 className="text-4xl lg:text-6xl font-black tracking-tighter text-text-main mb-4">Account Settings</h1>
                <p className="text-text-muted text-lg font-medium">Manage your personal information, addresses, and payment methods.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Sidebar Navigation - Desktop */}
                <div className="hidden lg:block lg:col-span-3 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={cn(
                                "w-full flex items-center gap-4 px-6 py-4 rounded-[28px] transition-all group",
                                activeTab === item.id
                                    ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/20"
                                    : "hover:bg-zinc-100 text-text-muted"
                            )}
                        >
                            <item.icon size={22} className={cn("transition-colors", activeTab === item.id ? "text-white" : "group-hover:text-text-main")} />
                            <span className="font-bold text-lg">{item.label}</span>
                        </button>
                    ))}

                    <div className="pt-8 mt-8 border-t border-zinc-100">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-[28px] text-rose-500 hover:bg-rose-50 transition-all font-bold text-lg"
                        >
                            <LogOut size={22} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Tab Switcher */}
                <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={cn(
                                "flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm whitespace-nowrap transition-all",
                                activeTab === item.id ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/10" : "bg-zinc-100 text-text-muted"
                            )}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8"
                            >
                                {/* User Bio Card */}
                                <div className="card p-10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                                    <div className="w-20 h-20 rounded-[32px] bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-8">
                                        <User size={40} strokeWidth={1.5} />
                                    </div>
                                    <h2 className="text-3xl font-black text-text-main mb-2">{user.name}</h2>
                                    <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-8">{user.role}</p>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                            <Phone size={20} className="text-text-muted" />
                                            <div>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phone Number</p>
                                                <p className="font-bold text-text-main">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                            <Mail size={20} className="text-text-muted" />
                                            <div>
                                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email Address</p>
                                                <p className="font-bold text-text-main">{user.email || "Not provided"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Links / Stats */}
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <button onClick={() => router.push('/orders')} className="card p-8 flex flex-col items-center justify-center text-center hover:shadow-2xl transition-all group">
                                            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <History size={28} />
                                            </div>
                                            <span className="font-black text-sm uppercase tracking-widest text-text-main">Orders</span>
                                        </button>
                                        <button onClick={() => router.push('/cart')} className="card p-8 flex flex-col items-center justify-center text-center hover:shadow-2xl transition-all group">
                                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <ShoppingBag size={28} />
                                            </div>
                                            <span className="font-black text-sm uppercase tracking-widest text-text-main">Cart</span>
                                        </button>
                                    </div>

                                    <div className="card p-8 bg-zinc-900 text-white">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                                <Shield size={24} className="text-brand-primary" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Security Status</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Account Protected</h3>
                                        <p className="text-sm text-zinc-400 font-medium">Your profile is secured with encrypted data protection.</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "addresses" && (
                            <motion.div
                                key="addresses"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-text-main mb-1">Your Addresses</h2>
                                        <p className="text-text-muted font-medium">Manage your delivery locations for faster checkout.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingAddress(null);
                                            setAddressForm({ street: "", city: "", state: "", zip: "", isDefault: false });
                                            setIsAddressModalOpen(true);
                                        }}
                                        className="btn btn-primary px-6 py-4 rounded-3xl flex items-center gap-2 shadow-xl shadow-brand-primary/20"
                                    >
                                        <Plus size={20} />
                                        <span className="font-bold">Add New</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {addresses.map((addr) => (
                                        <div key={addr.id} className="card p-6 flex items-start gap-4 hover:shadow-2xl transition-all group relative">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                                                addr.isDefault ? "bg-brand-primary text-white" : "bg-zinc-100 text-zinc-400"
                                            )}>
                                                <MapPin size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-lg text-text-main truncate">{addr.city}</span>
                                                    {addr.isDefault && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">Default</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-muted font-medium leading-relaxed">
                                                    {addr.street}, {addr.state} - {addr.zip}
                                                </p>
                                            </div>
                                            <div className="absolute top-6 right-6 flex flex-col gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingAddress(addr);
                                                        setAddressForm({
                                                            street: addr.street,
                                                            city: addr.city,
                                                            state: addr.state,
                                                            zip: addr.zip,
                                                            isDefault: addr.isDefault
                                                        });
                                                        setIsAddressModalOpen(true);
                                                    }}
                                                    className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                                                >
                                                    <Settings size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <div className="col-span-full py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[40px] flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-zinc-300 mb-6 shadow-sm">
                                                <MapPin size={32} />
                                            </div>
                                            <p className="font-black text-text-muted uppercase tracking-widest">No addresses saved yet</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "payments" && (
                            <motion.div
                                key="payments"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-black text-text-main mb-1">Payment Methods</h2>
                                        <p className="text-text-muted font-medium">Securely saved options for a one-tap checkout experience.</p>
                                    </div>
                                    <button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="btn btn-primary px-6 py-4 rounded-3xl flex items-center gap-2 shadow-xl shadow-brand-primary/20"
                                    >
                                        <Plus size={20} />
                                        <span className="font-bold">Add New</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {payments.map((pm) => (
                                        <div key={pm.id} className="card p-6 flex items-center gap-5 hover:shadow-2xl transition-all group relative overflow-hidden">
                                            {/* Glow Background */}
                                            <div className={cn(
                                                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity",
                                                pm.type === "CARD" ? "bg-gradient-to-br from-indigo-500 to-purple-600" : "bg-gradient-to-br from-emerald-400 to-teal-600"
                                            )} />

                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 z-10",
                                                pm.type === "CARD" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                                            )}>
                                                {pm.type === "CARD" ? <CardIcon size={28} /> : <Wallet size={28} />}
                                            </div>

                                            <div className="flex-1 min-w-0 z-10 pr-10">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-black text-lg text-text-main">{pm.provider}</span>
                                                    {pm.isDefault && (
                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-brand-primary text-white px-2 py-0.5 rounded-full">Primary</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-text-muted font-black tracking-widest">{pm.identifier}</p>
                                            </div>

                                            <button
                                                onClick={() => handleDeletePayment(pm.id)}
                                                className="absolute top-1/2 -translate-y-1/2 right-6 w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm z-10"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {payments.length === 0 && (
                                        <div className="col-span-full py-20 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[40px] flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-zinc-300 mb-6 shadow-sm">
                                                <CreditCard size={32} />
                                            </div>
                                            <p className="font-black text-text-muted uppercase tracking-widest">No payment methods saved</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 flex gap-4">
                                    <Info className="text-amber-600 flex-shrink-0" size={20} />
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        Your payment information is stored securely following PCI-DSS standards. We only store tokens and basic provider info, never your full card numbers or PINs.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Address Modal */}
            <AnimatePresence>
                {isAddressModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddressModalOpen(false)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
                        >
                            <button onClick={() => setIsAddressModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-text-main"><X /></button>
                            <h2 className="text-3xl font-black text-text-main mb-8">{editingAddress ? "Edit Address" : "Add Address"}</h2>

                            <form onSubmit={handleAddressSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Street Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-text-main focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                        placeholder="Flat 101, Swapee Greens..."
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">City</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-text-main outline-none focus:ring-2 focus:ring-brand-primary"
                                            value={addressForm.city}
                                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">State</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-text-main outline-none focus:ring-2 focus:ring-brand-primary"
                                            value={addressForm.state}
                                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Pincode</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-text-main outline-none focus:ring-2 focus:ring-brand-primary"
                                            value={addressForm.zip}
                                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-end h-full pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setAddressForm({ ...addressForm, isDefault: !addressForm.isDefault })}
                                            className={cn(
                                                "px-6 h-full flex items-center gap-2 rounded-2xl font-bold text-sm transition-all",
                                                addressForm.isDefault ? "bg-brand-primary/10 text-brand-primary shadow-inner" : "bg-zinc-100 text-zinc-400"
                                            )}
                                        >
                                            {addressForm.isDefault && <Check size={16} />}
                                            Default Address
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" className="w-full btn btn-primary py-5 rounded-3xl font-black shadow-xl shadow-brand-primary/20 mt-4">
                                    {editingAddress ? "Save Changes" : "Save Address"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payment Modal */}
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
                        >
                            <button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-text-main"><X /></button>
                            <h2 className="text-3xl font-black text-text-main mb-8">Save Payment</h2>

                            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentForm({ ...paymentForm, type: "UPI" })}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                                            paymentForm.type === "UPI" ? "bg-brand-primary/5 border-brand-primary" : "bg-zinc-50 border-zinc-100 opacity-60"
                                        )}
                                    >
                                        <Wallet className={paymentForm.type === "UPI" ? "text-brand-primary" : "text-zinc-400"} />
                                        <span className="font-bold text-sm">UPI ID</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentForm({ ...paymentForm, type: "CARD" })}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                                            paymentForm.type === "CARD" ? "bg-brand-primary/5 border-brand-primary" : "bg-zinc-50 border-zinc-100 opacity-60"
                                        )}
                                    >
                                        <CardIcon className={paymentForm.type === "CARD" ? "text-brand-primary" : "text-zinc-400"} />
                                        <span className="font-bold text-sm">Debit/Credit Card</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{paymentForm.type === "CARD" ? "Card Network" : "UPI Provider"}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-text-main outline-none focus:ring-2 focus:ring-brand-primary"
                                        placeholder={paymentForm.type === "CARD" ? "Visa, Mastercard, HDFC..." : "Google Pay, PhonePe, Paytm..."}
                                        value={paymentForm.provider}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">{paymentForm.type === "CARD" ? "Masked Card No." : "UPI Handle"}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-text-main outline-none focus:ring-2 focus:ring-brand-primary"
                                        placeholder={paymentForm.type === "CARD" ? "**** **** **** 1234" : "swapee@oksbi"}
                                        value={paymentForm.identifier}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, identifier: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center gap-3 ml-2">
                                    <input
                                        type="checkbox"
                                        id="defaultPayment"
                                        className="w-5 h-5 rounded-lg border-zinc-300 text-brand-primary focus:ring-brand-primary"
                                        checked={paymentForm.isDefault}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                                    />
                                    <label htmlFor="defaultPayment" className="text-sm font-bold text-text-muted">Set as primary payment method</label>
                                </div>

                                <button type="submit" className="w-full btn btn-primary py-5 rounded-3xl font-black shadow-xl shadow-brand-primary/20 mt-4">
                                    Save Payment
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
