"use client";

import ResponsiveShell from "@/components/layout/ResponsiveShell";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <ResponsiveShell>
            {children}
        </ResponsiveShell>
    );
}
