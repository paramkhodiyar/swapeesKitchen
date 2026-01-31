"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    CreditCard,
    Banknote,
    Smartphone,
    Loader2,
    ShieldCheck,
    Lock,
    ChevronLeft,
    ChefHat,
    QrCode
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [amount, setAmount] = useState<string | null>(searchParams.get("amount"));

    const [loading, setLoading] = useState(false);
    const [fetchingOrder, setFetchingOrder] = useState(!amount);
    const [selectedMethod, setSelectedMethod] = useState<"CARD" | "UPI" | "COD" | "QR">("UPI");

    useEffect(() => {
        if (!orderId) {
            toast.error("Order ID is missing");
            router.push("/orders");
            return;
        }

        if (!amount) {
            // Fetch order to get amount if not in URL
            const fetchOrder = async () => {
                setFetchingOrder(true);
                try {
                    const response = await api.get(`/orders/my-orders`);
                    const order = response.data.find((o: any) => o.id === orderId);
                    if (order) {
                        setAmount(order.totalAmount);
                    } else {
                        toast.error("Order not found");
                        router.push("/orders");
                    }
                } catch (error) {
                    toast.error("Failed to fetch order details");
                    router.push("/orders");
                } finally {
                    setFetchingOrder(false);
                }
            };
            fetchOrder();
        }
    }, [orderId, amount, router]);

    const handlePayment = async () => {
        if (!orderId) return;

        setLoading(true);
        try {
            // Artificial delay for gateway feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            await api.put(`/orders/${orderId}/pay`, { method: selectedMethod });

            toast.success("Payment successful!");
            router.push("/orders");
        } catch (error) {
            console.error(error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingOrder) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
                <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Securing Payment Gateway...</p>
            </div>
        );
    }

    if (!orderId || !amount) return null;

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-md w-full">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors mb-6 text-xs font-bold uppercase tracking-widest"
                >
                    <ChevronLeft size={16} />
                    Back to Orders
                </button>

                <div className="card p-8 md:p-10 shadow-2xl shadow-zinc-200/50">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 rounded-3xl bg-brand-primary flex items-center justify-center text-white shadow-xl shadow-brand-primary/20 mb-6">
                            <ChefHat size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-text-main mb-1">Complete Order</h1>
                        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Order ID: #{orderId.slice(0, 8)}</p>

                        <div className="mt-8 flex flex-col items-center">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Payment Amount</span>
                            <div className="text-5xl font-black text-text-main tracking-tighter">
                                <span className="text-xl mr-1">₹</span>{amount}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-10">
                        <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Select Payment Method</label>
                        <PaymentMethodItem
                            icon={Smartphone}
                            label="Pay via UPI"
                            description="Google Pay, PhonePe, Paytm"
                            selected={selectedMethod === "UPI"}
                            onClick={() => setSelectedMethod("UPI")}
                        />
                        <PaymentMethodItem
                            icon={QrCode}
                            label="Scan QR Code"
                            description="Instant payment via any app"
                            selected={selectedMethod === "QR"}
                            onClick={() => setSelectedMethod("QR")}
                        />
                        <PaymentMethodItem
                            icon={CreditCard}
                            label="Cards"
                            description="Debit, Credit, Amex"
                            selected={selectedMethod === "CARD"}
                            onClick={() => setSelectedMethod("CARD")}
                        />
                        <PaymentMethodItem
                            icon={Banknote}
                            label="Cash on Delivery"
                            description="Pay when your food arrives"
                            selected={selectedMethod === "COD"}
                            onClick={() => setSelectedMethod("COD")}
                        />
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="btn btn-primary w-full py-5 rounded-3xl text-lg font-black shadow-2xl shadow-brand-primary/20 flex items-center justify-center group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    <ShieldCheck className="mr-3 group-hover:scale-110 transition-transform" />
                                    Secure Payment
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-3 py-2">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                <Lock size={10} /> 256-bit SSL
                            </div>
                            <div className="w-1 h-1 rounded-full bg-zinc-200" />
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                PCI-DSS Compliant
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center px-6">
                    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase">
                        By proceeding, you agree to Swapee's Kitchen <br />
                        <span className="underline cursor-pointer hover:text-brand-primary">Refund Policy</span> and <span className="underline cursor-pointer hover:text-brand-primary">Terms of Service</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}

function PaymentMethodItem({ icon: Icon, label, description, selected, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border",
                selected
                    ? "bg-brand-primary/5 border-brand-primary ring-1 ring-brand-primary/10 shadow-lg shadow-brand-primary/5"
                    : "bg-white border-zinc-100 hover:border-zinc-200 lg:hover:shadow-md"
            )}
        >
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                selected ? "bg-brand-primary text-white" : "bg-zinc-100 text-text-muted"
            )}>
                <Icon size={24} strokeWidth={selected ? 2.5 : 2} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={cn("font-bold text-sm transition-colors", selected ? "text-brand-primary" : "text-text-main")}>{label}</h4>
                <p className="text-[10px] text-text-muted font-medium truncate">{description}</p>
            </div>
            {selected && (
                <div className="w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center text-white scale-110 animate-in zoom-in duration-300">
                    <CheckCircle2 size={14} strokeWidth={3} />
                </div>
            )}
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50">
                <Loader2 className="animate-spin text-brand-primary mb-4" size={40} />
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}
