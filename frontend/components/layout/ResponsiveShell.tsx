"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Utensils,
    Apple,
    ShoppingCart,
    ClipboardList,
    User,
    LayoutDashboard,
    Menu as MenuIcon,
    Users,
    BarChart3,
    ChefHat,
    LogOut
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSettingsStore } from "@/store/useSettingsStore";
import { AlertCircle } from "lucide-react";
import OfflineModal from "@/components/ui/OfflineModal";

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
}

export default function ResponsiveShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const { items: cartItems } = useCartStore();
    const { isOnline, offlineMessage, contactNumber } = useSettingsStore();
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/login");
        toast.success("Logged out successfully");
    };

    const isOwner = user?.role === "OWNER";

    const customerSidebarItems = [
        { label: "Meals", icon: Utensils, href: "/menu" },
        { label: "Fruits", icon: Apple, href: "/fruits" },
        { label: "Orders", icon: ClipboardList, href: "/orders" },
        { label: "Profile", icon: User, href: "/profile" },
    ];

    const customerBottomNavItems = [
        { label: "Meals", icon: Utensils, href: "/menu" },
        { label: "Fruits", icon: Apple, href: "/fruits" },
        { label: "Cart", icon: ShoppingCart, href: "/cart", count: cartItems.length },
        { label: "Orders", icon: ClipboardList, href: "/orders" },
        { label: "Profile", icon: User, href: "/profile" },
    ];

    const ownerNavItems = [
        { label: "Dashboard", icon: LayoutDashboard, href: "/owner/dashboard" },
        { label: "Menu", icon: MenuIcon, href: "/owner/menu" },
        { label: "Orders", icon: ClipboardList, href: "/owner/orders" },
        { label: "Customers", icon: Users, href: "/owner/customers" },
        { label: "Analytics", icon: BarChart3, href: "/owner/analytics" },
    ];

    const navItems = isOwner ? ownerNavItems : customerSidebarItems;
    const bottomNavItems = isOwner ? ownerNavItems.slice(0, 5) : customerBottomNavItems;

    return (
        <div className="flex flex-col min-h-screen bg-background text-text-main">
            <div className="flex flex-1 relative overflow-hidden">
                <OfflineModal />
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 border-r border-border bg-card">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-sm">
                            <ChefHat size={24} />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Swapee's Kitchen</span>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto sidebar-scroll">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                                        isActive
                                            ? "bg-brand-primary text-white shadow-sm"
                                            : "hover:bg-zinc-100 text-text-muted hover:text-text-main"
                                    )}
                                >
                                    <item.icon size={20} className={cn(
                                        "transition-colors",
                                        isActive ? "text-white" : "text-text-muted group-hover:text-brand-primary"
                                    )} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-border space-y-2">
                        {!isOwner && (
                            <Link
                                href="/cart"
                                className={cn(
                                    "flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 bg-zinc-50 border border-border hover:border-brand-primary text-sm font-medium",
                                    pathname === "/cart" && "border-brand-primary ring-1 ring-brand-primary/20"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <ShoppingCart size={20} className="text-zinc-600" />
                                    <span>Cart</span>
                                </div>
                                {cartItems.length > 0 && (
                                    <span className="bg-brand-primary text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-rose-600 hover:bg-rose-50 text-sm font-bold"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>

                        <div className="flex items-center gap-3 px-4 py-2 border-t border-border pt-4 mt-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
                                <User size={16} className="text-zinc-500" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold truncate">{user?.name || "Guest"}</span>
                                <span className="text-[10px] text-text-muted uppercase tracking-wider">{user?.role || "CUSTOMER"}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className={cn(
                    "flex-1 transition-all duration-200 overflow-y-auto",
                    "lg:ml-64", // Header space for sidebar
                    "pb-20 lg:pb-0" // Space for bottom nav on mobile
                )}>
                    {!isOnline && !isOwner && (
                        <div className="bg-rose-600 text-white py-3 px-4 text-center sticky top-0 z-[100] animate-pulse">
                            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                <AlertCircle size={16} />
                                <span>{offlineMessage}</span>
                                <div className="h-4 w-px bg-white/30 hidden sm:block" />
                                <span className="hidden sm:inline">Support: {contactNumber}</span>
                            </div>
                        </div>
                    )}
                    {/* Mobile Header for Owners */}
                    {isOwner && (
                        <header className="lg:hidden flex items-center justify-between px-6 h-16 bg-white border-b border-zinc-100 sticky top-0 z-[60]">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                                    <ChefHat size={18} />
                                </div>
                                <span className="font-black text-sm tracking-tight">Kitchen Control</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center transition-all active:scale-95"
                            >
                                <LogOut size={20} />
                            </button>
                        </header>
                    )}

                    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex justify-around items-center px-2 z-50 safe-area-aware">
                    {bottomNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-200",
                                    isActive ? "text-brand-primary" : "text-text-muted"
                                )}
                            >
                                <div className="relative">
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    {"count" in item && (item as any).count > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-1 border-2 border-white">
                                            {(item as any).count}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
