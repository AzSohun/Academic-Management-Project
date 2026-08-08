"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await login({ email, password });
        } catch (err: any) {
            setError(err.response?.data?.message || "Login Failed");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 p-6">
            <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />

            <Link
                href="/"
                className="absolute top-6 left-6 z-10 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                Back Home
            </Link>

            <form
                onSubmit={handleSubmit}
                className="relative z-10 bg-slate-900/70 backdrop-blur-xl p-8 rounded-xl shadow-2xl shadow-black/50 w-96 border border-slate-800"
            >
                <h2 className="text-2xl font-bold mb-1 text-center bg-linear-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
                    Welcome Back
                </h2>
                <p className="text-slate-500 text-sm text-center mb-6">
                    Sign in to continue to your dashboard
                </p>

                {error && (
                    <p className="text-red-400 mb-4 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">
                        {error}
                    </p>
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mb-4 p-3 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-6 p-3 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-md font-medium shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none transition-all duration-300"
                >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                </button>

                <p className="text-slate-500 text-sm text-center mt-6">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}