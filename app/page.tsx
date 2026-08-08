import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-center">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-br from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent mb-4">
          Academic Management System
        </h1>
        <p className="text-slate-400 max-w-md mb-10 leading-relaxed">
          Manage assignments, submissions, and classes seamlessly based on your role.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-linear-to-br from-indigo-600 to-purple-600 text-white font-medium rounded-md shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2.5 border border-slate-700 bg-slate-900/50 text-slate-300 rounded-md backdrop-blur-sm hover:bg-slate-800 hover:border-indigo-500/50 hover:text-white transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
