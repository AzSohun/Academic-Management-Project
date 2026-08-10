"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 sm:p-6 select-none">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Back Home Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium px-3.5 py-2 rounded-md bg-slate-900/50 border border-slate-700/80 backdrop-blur-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                Back Home
            </Link>

            {/* Login Form Container */}
            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-md bg-slate-900/70 backdrop-blur-xl p-8 rounded-xl shadow-2xl shadow-black/80 border border-slate-800"
            >
                <h2 className="text-3xl font-bold mb-1 text-center bg-linear-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
                    Welcome Back
                </h2>
                <p className="text-slate-400 text-sm text-center mb-6">
                    Sign in to continue to your dashboard
                </p>

                {error && (
                    <div className="mb-6 p-3 rounded-md bg-red-900/20 border border-red-900/50 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    {/* Password Input with Eye Toggle */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 pr-10 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                        <line x1="2" x2="22" y1="2" y2="22" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-md font-medium shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none transition-all duration-300"
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