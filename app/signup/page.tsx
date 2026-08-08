"use client";


import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

export default function SignUpPage() {

    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        gender: 0,       // 0: Male, 1: Female
        role: 2          // 0: Admin, 1: Teacher, 2: Student 
    });


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'gender' || name === 'role' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/signup', formData);

            if (res.data.message === 'User already exists') {
                setError('User with this email already exists.');
                return;
            }

            alert('Registration Successful! Please Login.');
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
            {/* Ambient glow blobs */}
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

            <div className="relative z-10 bg-slate-900/70 backdrop-blur-xl p-8 rounded-xl shadow-2xl shadow-black/50 w-full max-w-md border border-slate-800">
                <h2 className="text-2xl font-bold mb-1 text-center bg-linear-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent">
                    Create an Account
                </h2>
                <p className="text-slate-500 text-sm text-center mb-6">
                    Join the platform to get started
                </p>

                {error && (
                    <div className="mb-4 text-sm bg-red-900/20 border border-red-900/50 text-red-400 p-3 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-slate-800/70 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-slate-800/70 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value={0} className="bg-slate-800">Male</option>
                                <option value={1} className="bg-slate-800">Female</option>
                            </select>
                        </div>

                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Register As</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-slate-800/70 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                <option value={2} className="bg-slate-800">Student</option>
                                <option value={1} className="bg-slate-800">Teacher</option>
                                <option value={0} className="bg-slate-800">Admin</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium py-2.5 rounded-md shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none transition-all duration-300 mt-2"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}
