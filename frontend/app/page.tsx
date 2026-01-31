"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Utensils,
  Heart,
  ShieldCheck,
  Clock,
  ArrowRight,
  Instagram,
  Twitter,
  ChefHat,
  Smartphone,
  MapPin,
  Star,
  AlertCircle,
  Phone
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const { fetchMe, user } = useAuthStore();
  const { isOnline, offlineMessage, contactNumber } = useSettingsStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const features = [
    {
      icon: Heart,
      title: "Home Cooked",
      desc: "Authentic family recipes made from scratch with premium ingredients and no preservatives.",
      color: "bg-rose-50 text-rose-600"
    },
    {
      icon: ShieldCheck,
      title: "Hygienic",
      desc: "Highest standards of cleanliness in our home kitchen. We treat every meal like it's for our own family.",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: Clock,
      title: "On Time",
      desc: "Pre-order your meals or fruits and get them delivered exactly when you need them.",
      color: "bg-amber-50 text-amber-600"
    },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-brand-primary selection:text-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-20 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
              <ChefHat size={22} />
            </div>
            <span className="font-black text-xl md:text-2xl tracking-tighter text-text-main">
              Swapee's <span className="text-brand-primary">Kitchen</span>
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            <Link href="/menu" className="text-sm font-bold text-text-muted hover:text-brand-primary transition-colors uppercase tracking-widest">Menu</Link>
            <Link href="/fruits" className="text-sm font-bold text-text-muted hover:text-brand-primary transition-colors uppercase tracking-widest">Fruits</Link>
            <Link href="#features" className="text-sm font-bold text-text-muted hover:text-brand-primary transition-colors uppercase tracking-widest">Why Us</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <Link href={user.role === 'OWNER' ? '/owner/dashboard' : '/menu'}
                className="btn btn-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xl shadow-brand-primary/20">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-xs sm:text-sm font-bold text-text-main hover:text-brand-primary transition-colors">Login</Link>
                <Link href="/signup" className="btn btn-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xl shadow-brand-primary/20">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-amber-100/30 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full mb-6 sm:mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-primary animate-ping" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-muted">Fresh Batch Available Now</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl md:text-8xl font-black text-text-main tracking-tighter leading-[1.1] sm:leading-[0.9] mb-6 sm:mb-8"
            >
              Taste the <span className="text-brand-primary">Warmth</span> of <br className="hidden sm:block" />
              Home-Cooked Stories.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl text-text-muted font-medium max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed"
            >
              Authentic Indian flavors prepared with pure love and the finest ingredients.
              From our home kitchen directly to your heart, every meal is a batch of happiness.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center"
            >
              <button
                onClick={() => router.push("/menu")}
                className="btn btn-primary px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-base sm:text-lg font-black shadow-2xl shadow-brand-primary/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
              >
                Explore Today's Menu <ArrowRight size={22} />
              </button>
              <button
                onClick={() => router.push("/fruits")}
                className="bg-emerald-50 text-emerald-700 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-base sm:text-lg font-black border border-emerald-100 hover:bg-emerald-100 transition-all"
              >
                Preorder Fresh Fruits
              </button>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-text-main">500+</span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Happy Tummies</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-text-main">4.9/5</span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Average Rating</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-text-main">0%</span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Preservatives</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black text-text-main">100%</span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Home Made</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-brand-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">The Swapee's Difference</span>
            <h2 className="text-4xl md:text-5xl font-black text-text-main tracking-tight">Why Choose Our Kitchen?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-[40px] shadow-sm border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all group"
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", item.color)}>
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-text-main mb-4 tracking-tight">{item.title}</h3>
                <p className="text-text-muted font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* App Promotion Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-zinc-900 rounded-[60px] p-8 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center gap-16">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="flex-1 relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Kitchen in your pocket.</h2>
              <p className="text-zinc-400 text-lg mb-12 max-w-md">Download our progressive web app for the fastest ordering experience and exclusive deals.</p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-zinc-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Smartphone size={18} /> Add to Home
                </button>
                <button className="bg-zinc-800 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <Star size={18} className="text-amber-400" /> Web App
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-sm relative">
              <div className="aspect-[9/16] bg-zinc-800 rounded-[40px] border-[8px] border-zinc-700 shadow-2xl relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <div className="w-12 h-12 bg-brand-primary rounded-xl mb-4" />
                  <div className="h-4 w-3/4 bg-white/20 rounded-full mb-2" />
                  <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-white">
                  <ChefHat size={22} />
                </div>
                <span className="font-black text-2xl tracking-tighter text-text-main">
                  Swapee's<span className="text-brand-primary"> Kitchen</span>
                </span>
              </div>
              <p className="text-text-muted text-lg max-w-md mb-8 leading-relaxed">
                Bringing back the authentic, slow-cooked flavors of traditional Indian kitchens to the modern fast-paced world.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-text-muted hover:text-brand-primary hover:bg-brand-primary/10 transition-all"><Twitter size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-black text-sm uppercase tracking-widest text-text-main mb-8">Navigation</h4>
              <ul className="space-y-4">
                <li><Link href="/menu" className="text-text-muted font-bold hover:text-brand-primary transition-colors">Today's Menu</Link></li>
                <li><Link href="/fruits" className="text-text-muted font-bold hover:text-brand-primary transition-colors">Fruit Preorders</Link></li>
                <li><Link href="/orders" className="text-text-muted font-bold hover:text-brand-primary transition-colors">View Orders</Link></li>
                <li><Link href="/login" className="text-text-muted font-bold hover:text-brand-primary transition-colors">Login / Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-sm uppercase tracking-widest text-text-main mb-8">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-text-muted font-bold hover:text-brand-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-text-muted font-bold hover:text-brand-primary transition-colors">FAQs</a></li>
                <li><a href="#" className="text-text-muted font-bold hover:text-brand-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-text-muted font-bold hover:text-brand-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
              © {new Date().getFullYear()} Swapee's Kitchen. Crafted with pure love.
            </p>
            <div className="flex items-center gap-3 text-xs font-bold text-text-muted uppercase tracking-widest">
              <MapPin size={14} className="text-brand-primary" /> India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
