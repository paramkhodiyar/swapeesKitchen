"use client";

import Link from "next/link";
import { MoveLeft, ChefHat } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center animate-fade-in">
            <div className="relative mb-12">
                <h1 className="text-[12rem] font-black text-brand-primary/5 leading-none select-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-hat text-brand-primary">
                        <ChefHat size={80} strokeWidth={1} />
                    </div>
                </div>
            </div>

            <h2 className="text-3xl font-extrabold text-text-main mb-3">Kitchen Mystery?</h2>
            <p className="text-text-muted font-medium mb-10 max-w-sm mx-auto">
                We couldn't find the recipe for this page. It might have been taken off the menu.
            </p>

            <Link
                href="/"
                className="btn btn-primary px-10 py-4 shadow-xl shadow-brand-primary/20"
            >
                <MoveLeft size={20} />
                <span>Go Back Home</span>
            </Link>
        </div>
    );
}
