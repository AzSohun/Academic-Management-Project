import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-zinc-950 p-6 sm:p-12 text-center">
      {/* Updated Gradient Shade Glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
        {/* Heading with Cyan/Violet Gradient Text */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-linear-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent mb-4 tracking-tight">
          Academic Management System
        </h1>
        <p className="text-slate-400 max-w-2xl text-base sm:text-lg mb-10 leading-relaxed">
          Manage assignments, submissions, and classes seamlessly based on your role.
        </p>

        {/* Full-width 3-Column Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 w-full text-left text-sm">
          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md hover:border-violet-500/30 transition-all">
            <h2 className="font-semibold text-white mb-1">Classroom Hub</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Create, manage, and organize courses and student rosters easily.
            </p>
          </div>
          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md hover:border-cyan-500/30 transition-all">
            <h2 className="font-semibold text-white mb-1">Assignment Portal</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Students submit homework files smoothly with deadline reminders.
            </p>
          </div>
          <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-xl backdrop-blur-md hover:border-emerald-500/30 transition-all">
            <h2 className="font-semibold text-white mb-1">Grading & Feedback</h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Review submissions, give instant marks, and post direct comments.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-linear-to-r from-violet-600 to-cyan-600 text-white font-medium rounded-lg shadow-lg shadow-violet-600/20 hover:shadow-cyan-500/30 hover:from-violet-500 hover:to-cyan-500 transition-all duration-300"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 border border-slate-700/80 bg-slate-900/60 text-slate-300 font-medium rounded-lg backdrop-blur-md hover:bg-slate-800 hover:border-violet-500/50 hover:text-white transition-all duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
