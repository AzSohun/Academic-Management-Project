import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Academic Management System</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Manage assignments, submissions, and classes seamlessly based on your role.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800">
          Login
        </Link>
        <Link href="/signup" className="px-6 py-2 border border-indigo-300 rounded-md hover:bg-indigo-100">
          Register
        </Link>
      </div>
    </main>
  );
}
