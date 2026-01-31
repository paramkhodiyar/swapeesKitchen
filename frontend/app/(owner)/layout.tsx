"use client";

import ResponsiveShell from "@/components/layout/ResponsiveShell";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <ResponsiveShell>
            {children}
        </ResponsiveShell>
    );
}
