"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'ryan-started-the-fire') {
            document.cookie = "admin_token=temp-session; path=/";
            router.push('/admin/dashboard');
        } else {
            alert("Invalid Admin Password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-sm w-full">
                <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow-sm w-full">Login</button>
                </form>
            </div>
        </div>
    );
}
