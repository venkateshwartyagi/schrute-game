"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Log = {
    id: number;
    level: number;
    prompt: string;
    response: string;
    success: number;
    timestamp: string;
};

export default function AdminDashboard() {
    const [logs, setLogs] = useState<Log[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Basic auth check
        if (!document.cookie.includes('admin_token')) {
            router.push('/admin/login');
            return;
        }

        fetch('/api/logs')
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Security Logs Dashboard</h1>

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Time</th>
                                <th className="p-4 font-semibold text-gray-600">Level</th>
                                <th className="p-4 font-semibold text-gray-600">User Prompt</th>
                                <th className="p-4 font-semibold text-gray-600">AI Response</th>
                                <th className="p-4 font-semibold text-gray-600">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-medium">{log.level}</td>
                                    <td className="p-4 max-w-xs truncate" title={log.prompt}>{log.prompt}</td>
                                    <td className="p-4 max-w-xs truncate text-gray-500" title={log.response}>{log.response}</td>
                                    <td className="p-4">
                                        {log.success ?
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">BREACH</span> :
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">SECURE</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
