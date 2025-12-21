"use client";

import { useState, useRef, useEffect } from 'react';
import { levels } from '@/lib/levels';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function GameInterface({ initialLevelId }: { initialLevelId: number }) {
    const router = useRouter();
    const level = levels.find(l => l.id === initialLevelId) || levels[0];

    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset state when level changes
    useEffect(() => {
        setMessages([{ role: 'assistant', content: `[SYSTEM] ${level.name} protocol initiated.\n\nOBJECTIVE: ${level.description}` }]);
        setErrorMsg('');
        setPasswordInput('');
    }, [level]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const msg = chatInput;
        setChatInput('');
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setIsChatLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, { role: 'user', content: msg }], levelId: level.id })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput.toLowerCase().trim() === level.password.toLowerCase().trim()) {
            const nextId = level.id + 1;
            if (levels.find(l => l.id === nextId)) {
                router.push(`/level/${nextId}`);
            } else {
                alert("YOU WIN! YOU ARE THE REGIONAL MANAGER!");
            }
        } else {
            setErrorMsg("Access Denied: Incorrect Password");
            setTimeout(() => setErrorMsg(''), 2000);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">

            {/* LEFT: Communication Terminal */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-[600px] flex flex-col">
                <div className="border-b pb-4 mb-4 flex justify-between items-center">
                    <h2 className="font-bold text-lg text-gray-700">Communication Link</h2>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full animate-pulse">
                        ● Connected: {level.name}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={clsx(
                            "flex animate-fade-in",
                            m.role === 'user' ? "justify-end" : "justify-start"
                        )} style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className={clsx(
                                "max-w-[85%] rounded-lg p-3 text-sm leading-relaxed shadow-sm transition-all hover:scale-[1.01]",
                                m.role === 'user'
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-800"
                            )}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-50 text-gray-500 rounded-lg p-3 text-xs italic">
                                Dwight is typing...
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-2 relative">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Send message..."
                        disabled={isChatLoading}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow-sm" disabled={isChatLoading}>
                        Send
                    </button>
                </form>
            </div>

            {/* RIGHT: Security Control */}
            <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-gray-900 text-white border-0 rounded-xl shadow-lg p-6">
                    <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Target Profile</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-2xl">
                            DS
                        </div>
                        <div>
                            <div className="font-bold text-xl">{level.name}</div>
                            <div className="text-yellow-500 text-sm">{level.difficulty} Clearance</div>
                        </div>
                    </div>
                </div>

                {/* Password Input */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-500 hover:shadow-xl">
                    <h3 className="text-gray-700 font-bold mb-4">Security Override</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Enter the correct verification code to bypass this security layer and upgrade your clearance level.
                    </p>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Passcode</label>
                            <input
                                type="text"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className={clsx(
                                    "w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-center tracking-widest text-lg uppercase",
                                    errorMsg ? "border-red-500 focus:ring-red-200" : ""
                                )}
                                placeholder="••••••••"
                            />
                        </div>

                        {errorMsg && (
                            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
                                {errorMsg}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded transition-colors shadow-sm border-none">
                            Unlock Next Level
                        </button>
                    </form>
                </div>
            </div>

        </div>
    );
}
