// app/dashboard/layout.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user && !token) {
            router.push('/login');
        }
    }, [user, token, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600 font-medium">Checking authentication...</p>
            </div>
        );
    }

    if (!user && !token) {
        return null;
    }

    return <>{children}</>;
}