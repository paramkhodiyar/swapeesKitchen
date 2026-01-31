"use client";

import React, { useEffect, useState } from "react";
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingBag,
    DollarSign,
    Users,
    BarChart3,
    PieChart,
    Calendar,
    Utensils,
    Apple
} from "lucide-react";
import api from "@/lib/api";
import { useLoader } from "@/app/LoaderProvider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const { setIsLoading } = useLoader();

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/orders/analytics");
            setData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!data) return null;

    const revenueLineData = {
        labels: data.dailyRevenue.map((d: any) => d.date),
        datasets: [{
            label: 'Revenue (₹)',
            data: data.dailyRevenue.map((d: any) => d.amount),
            borderColor: '#C48F56',
            backgroundColor: 'rgba(196, 143, 86, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#C48F56',
            pointBorderWidth: 2,
        }]
    };

    const categoryPieData = {
        labels: data.categoryPerformance.map((c: any) => c.name),
        datasets: [{
            data: data.categoryPerformance.map((c: any) => c.value),
            backgroundColor: [
                '#C48F56',
                '#10B981',
                '#3B82F6',
                '#F59E0B',
                '#EC4899',
            ],
            borderWidth: 0,
        }]
    };

    const lineOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1C1917',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' as const },
                bodyFont: { size: 13 },
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { font: { weight: 'bold' as const }, color: '#78716C' }
            },
            x: {
                grid: { display: false },
                ticks: { font: { weight: 'bold' as const }, color: '#78716C' }
            }
        }
    };

    const pieOptions = {
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { weight: 'bold' as const, size: 11 }
                }
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-text-main">Kitchen Insights</h1>
                    <p className="text-text-muted text-sm font-medium">Data-driven performance tracking for Swapee's Kitchen.</p>
                </div>
                <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                    <button className="px-6 py-2.5 bg-white shadow-sm rounded-xl text-xs font-black uppercase tracking-widest text-text-main transition-all">Last 7 Days</button>
                    <button className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-all">Last 30 Days</button>
                </div>
            </header>

            {/* Top Row Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`₹${data.revenue.month}`}
                    trend="+12% from last month"
                    trendUp={true}
                    color="text-emerald-600 bg-emerald-50"
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Weekly Orders"
                    value={data.counts.week}
                    trend="+5% from last week"
                    trendUp={true}
                    color="text-brand-primary bg-brand-primary/10"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg. Order Value"
                    value={`₹${(data.revenue.week / (data.counts.week || 1)).toFixed(2)}`}
                    trend="-2% vs yesterday"
                    trendUp={false}
                    color="text-blue-600 bg-blue-50"
                />
                <StatCard
                    icon={Calendar}
                    label="Today's Potential"
                    value={`₹${data.revenue.today}`}
                    trend="Steady growth"
                    trendUp={true}
                    color="text-purple-600 bg-purple-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 card p-8 lg:p-10 shadow-2xl shadow-zinc-200/50">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-text-main tracking-tight">Revenue Stream</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Daily earnings trend (Last 7 Days)</p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                            <ArrowUpRight size={18} /> +₹1,240 Today
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <Line data={revenueLineData} options={lineOptions} />
                    </div>
                </div>

                {/* Category Share */}
                <div className="card p-8 lg:p-10 shadow-2xl shadow-zinc-200/50 flex flex-col">
                    <div className="mb-10">
                        <h3 className="text-xl font-black text-text-main tracking-tight">Category Share</h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Revenue split by type</p>
                    </div>
                    <div className="flex-1 min-h-[300px] flex items-center justify-center">
                        <Doughnut data={categoryPieData} options={pieOptions} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Most Ordered Items */}
                <div className="card p-8 lg:p-10 shadow-2xl shadow-zinc-200/50">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-main">
                            <Utensils size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-main tracking-tight">Top Sellers</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Most popular items by unit volume</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {data.mostOrdered.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center font-black text-sm text-text-muted group-hover:bg-brand-primary group-hover:text-white transition-all">
                                        {idx + 1}
                                    </div>
                                    <span className="font-bold text-text-main group-hover:text-brand-primary transition-colors">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-px w-20 bg-zinc-100 group-hover:w-32 transition-all duration-500" />
                                    <span className="font-black text-lg text-text-main">{item.count} <span className="text-[10px] text-text-muted uppercase">Units</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operations Insights */}
                <div className="card p-8 lg:p-10 shadow-2xl shadow-zinc-200/50">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-text-main">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-main tracking-tight">Operational Stats</h3>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Cancellations and order status</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {data.cancellations.length > 0 ? (
                            data.cancellations.map((stat: any, idx: number) => (
                                <div key={idx} className="space-y-3">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                        <span className="text-text-muted">{stat.status.replace(/_/g, " ")}</span>
                                        <span className="text-text-main">{stat.count} Orders</span>
                                    </div>
                                    <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(stat.count / (data.counts.month || 1) * 100).toFixed(0)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                                    <ArrowUpRight size={32} />
                                </div>
                                <p className="text-xs font-black text-text-muted uppercase tracking-widest">No cancellations recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, trendUp, color }: any) {
    return (
        <div className="card p-8 group hover:border-brand-primary/30 transition-all duration-300 relative overflow-hidden">
            <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2", color.split(' ')[1])} />
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm", color)}>
                <Icon size={28} />
            </div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">{label}</p>
            <h3 className="text-4xl font-black text-text-main tracking-tighter mb-4">{value}</h3>
            <div className={cn(
                "flex items-center gap-1.5 text-xs font-black uppercase tracking-wide",
                trendUp ? "text-emerald-600" : "text-rose-600"
            )}>
                {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {trend}
            </div>
        </div>
    );
}
