"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import GlobalLoader from "@/components/GlobalLoader";
import { Toaster } from "react-hot-toast";

type LoaderContextType = {
    setIsLoading: (loading: boolean) => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoaderContext.Provider value={{ setIsLoading }}>
            <Toaster position="top-right" />
            {isLoading && <GlobalLoader />}
            {children}
        </LoaderContext.Provider>
    );
}

export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) throw new Error("useLoader must be used within a LoaderProvider");
    return context;
};
