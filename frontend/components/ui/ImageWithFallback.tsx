"use client";

import React, { useState } from "react";
import { ShoppingCart, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    src?: string;
    alt: string;
    className?: string;
}

export default function ImageWithFallback({ src, alt, className }: Props) {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={cn("flex flex-col items-center justify-center bg-zinc-50 text-zinc-300 gap-2", className)}>
                <ImageOff size={24} strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-tighter opacity-50">No Image</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
        />
    );
}
