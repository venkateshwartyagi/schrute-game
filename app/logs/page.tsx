"use client";

import { useEffect, useState } from 'react';

type Log = {
    id: number;
    level: number;
    prompt: string;
    response: string;
    success: boolean;
    ip?: string;
    timestamp: string;
};

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        fetch('/api/logs')
            .then(res => res.json())
            .then(data => setLogs(data.logs || []));
    }, []);

    return (
        <div className="min-h-screen bg-black text-[var(--dunder-gray)] font-mono p-8">
            <h1 className="text-3xl font-bold text-[var(--schrute-beet)] mb-6 border-b border-[var(--schrute-beet)] pb-2">
                SECURITY INCIDENT LOGS
            </h1>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#333] text-[var(--schrute-mustard)]">
                            <th className="p-2 border border-gray-700">Time</th>
                            <th className="p-2 border border-gray-700">IP Addr</th>
                            <th className="p-2 border border-gray-700">Lvl</th>
                            <th className="p-2 border border-gray-700">Intruder Prompt (Jim/Pam)</th>
                            <th className="p-2 border border-gray-700">Dwight Response</th>
                            <th className="p-2 border border-gray-700">Breach?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-[#222]">
                                <td className="p-2 border border-gray-700 text-xs text-gray-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="p-2 border border-gray-700 text-xs text-cyan-500 font-mono">
                                    {log.ip || 'unknown'}
                                </td>
                                <td className="p-2 border border-gray-700 text-center">{log.level}</td>
                                <td className="p-2 border border-gray-700 max-w-xs truncate" title={log.prompt}>
                                    {log.prompt}
                                </td>
                                <td className="p-2 border border-gray-700 max-w-xs truncate text-gray-500" title={log.response}>
                                    {log.response}
                                </td>
                                <td className="p-2 border border-gray-700 text-center">
                                    {log.success ?
                                        <span className="text-red-500 font-bold">YES</span> :
                                        <span className="text-green-500">NO</span>
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
