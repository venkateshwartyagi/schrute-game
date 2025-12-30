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
    const [showHint, setShowHint] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Reset state when level changes
    useEffect(() => {
        setMessages([{ role: 'assistant', content: `[SYSTEM] ${level.name} protocol initiated.\n\nOBJECTIVE: ${level.description}` }]);
        setErrorMsg('');
        setPasswordInput('');
        setShowHint(false);
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
                <div className="bg-gray-900 text-white border-0 rounded-xl shadow-lg p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl">DS</div>
                    <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Target Profile</h3>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold text-2xl shadow-lg ring-2 ring-yellow-400">
                            DS
                        </div>
                        <div>
                            <div className="font-bold text-xl">{level.name}</div>
                            <div className="text-yellow-500 text-sm font-mono">{level.difficulty} Clearance</div>
                        </div>
                    </div>

                    {/* Hint Section */}
                    <div className="border-t border-gray-700 pt-4">
                        {!showHint ? (
                            <button
                                onClick={() => setShowHint(true)}
                                className="text-xs text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
                            >
                                <span className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">?</span>
                                Reveal Hint
                            </button>
                        ) : (
                            <div className="animate-fade-in bg-gray-800/50 p-3 rounded border border-gray-700">
                                <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider block mb-1">Hint Protocol</span>
                                <p className="text-sm italic text-gray-300">{level.hint}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Input */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-500 hover:shadow-xl">
                    <h3 className="text-gray-700 font-bold mb-4">Security Override</h3>
                    <p className="text-sm text-gray-500 mb-6 font-mono">
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

            {/* SEO Content Block (Subtle/Collapsed style or just bottom footer) */}
            <div className="col-span-1 lg:col-span-2 mt-12 border-t border-gray-200 pt-8 text-gray-400">
                <section className="prose prose-sm prose-gray mx-auto text-center max-w-3xl">
                    <h1 className="text-xl font-bold text-gray-600 mb-2">Schrute: An AI Security Game for Prompt Injection & LLM Safety</h1>
                    <p className="mb-4">
                        Schrute is an interactive AI security game designed to demonstrate real-world risks such as
                        <strong>prompt injection</strong>, <strong>jailbreak attacks</strong>, and unsafe LLM behavior.
                    </p>
                    <div className="text-xs text-gray-400">
                        <h2 className="inline font-bold">Why Play?</h2> Schrute challenges players to extract a protected secret while the AI follows strict safety rules.
                        It is a practical way for security engineers and enthusiasts to test their Red Teaming skills against a fortified LLM.
                    </div>
                </section>

                {/* Schema Markup */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "SoftwareApplication",
                            "name": "Schrute",
                            "applicationCategory": "SecurityApplication",
                            "operatingSystem": "Web",
                            "description": "An AI security game to test prompt injection and LLM safety",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "author": {
                                "@type": "Organization",
                                "name": "Exploits Research Labs"
                            }
                        })
                    }}
                />
            </div>

        </div>
    );
}
