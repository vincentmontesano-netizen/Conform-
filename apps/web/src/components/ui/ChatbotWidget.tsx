'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, Bot, AlertCircle } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
}

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Bonjour ! Je suis l\'assistant juridique expert de CONFORM+. Comment puis-je vous aider avec vos obligations de conformité aujourd\'hui ?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Appel API Proxy vers Mistral (NestJS)
            const res = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) throw new Error('Erreur de communication avec l\'assistant.');

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.content,
                    sources: data.sources,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Désolé, une erreur est survenue lors de la communication avec la base de connaissances. Veuillez réessayer plus tard.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {/* Bouton Widget Flottant (Exact HTML from user requirements) */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    id="chatbase-bubble-button"
                    aria-label="chat-button"
                    style={{
                        position: 'fixed',
                        border: '0px',
                        bottom: '1.5rem',
                        right: '1.5rem',
                        width: '55px',
                        height: '55px',
                        borderRadius: '27.5px',
                        backgroundColor: 'rgb(59, 129, 246)',
                        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 4px 8px 0px',
                        cursor: 'pointer',
                        zIndex: 2147483645,
                        pointerEvents: 'auto',
                        transition: '0.2s ease-in-out',
                        left: 'unset',
                        transform: 'scale(1)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            zIndex: 2147483646,
                        }}
                    >
                        <svg width="55" height="55" viewBox="0 0 1120 1120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M252 434C252 372.144 302.144 322 364 322H770C831.856 322 882 372.144 882 434V614.459L804.595 585.816C802.551 585.06 800.94 583.449 800.184 581.405L763.003 480.924C760.597 474.424 751.403 474.424 748.997 480.924L711.816 581.405C711.06 583.449 709.449 585.06 707.405 585.816L606.924 622.997C600.424 625.403 600.424 634.597 606.924 637.003L707.405 674.184C709.449 674.94 711.06 676.551 711.816 678.595L740.459 756H629.927C629.648 756.476 629.337 756.945 628.993 757.404L578.197 825.082C572.597 832.543 561.403 832.543 555.803 825.082L505.007 757.404C504.663 756.945 504.352 756.476 504.073 756H364C302.144 756 252 705.856 252 644V434ZM633.501 471.462C632.299 468.212 627.701 468.212 626.499 471.462L619.252 491.046C618.874 492.068 618.068 492.874 617.046 493.252L597.462 500.499C594.212 501.701 594.212 506.299 597.462 507.501L617.046 514.748C618.068 515.126 618.874 515.932 619.252 516.954L626.499 536.538C627.701 539.788 632.299 539.788 633.501 536.538L640.748 516.954C641.126 515.932 641.932 515.126 642.954 514.748L662.538 507.501C665.788 506.299 665.788 501.701 662.538 500.499L642.954 493.252C641.932 492.874 641.126 492.068 640.748 491.046L633.501 471.462Z" fill="white"></path>
                            <path d="M771.545 755.99C832.175 755.17 881.17 706.175 881.99 645.545L804.595 674.184C802.551 674.94 800.94 676.551 800.184 678.595L771.545 755.99Z" fill="white"></path>
                        </svg>
                    </div>
                </button>
            )}

            {/* Interface de Chat (Popover) */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[2147483647] flex h-[600px] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-[#white/10] bg-[#1a1f28] shadow-2xl sm:bottom-8 sm:right-8 transition-all animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 bg-blue-600 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">Assistant Conform+</span>
                                <span className="text-[10px] text-white/80">Propulsé par Mistral AI</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f1117]/50 scroll-smooth">
                        <div className="text-center">
                            <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-medium text-blue-400">
                                Base documentaire validée : Active
                            </span>
                        </div>

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                            >
                                <div
                                    className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-[#1e2532] text-white/90 border border-white/5 rounded-bl-none'
                                        }`}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                >
                                    {msg.content}
                                </div>

                                {/* Sources / Citations rendered below assistant message */}
                                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-[10px] font-semibold text-white/40 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Sources certifiées :
                                        </p>
                                        <ul className="space-y-1 pl-4">
                                            {msg.sources.map((src, i) => (
                                                <li key={i} className="text-[10px] text-blue-400 list-disc opacity-80">
                                                    {src}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="mr-auto flex max-w-[85%] items-start">
                                <div className="rounded-2xl rounded-bl-none border border-white/5 bg-[#1e2532] px-4 py-3 shadow-sm">
                                    <div className="flex gap-1.5">
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]"></span>
                                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/40"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-white/10 bg-[#161b22] px-4 py-3">
                        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (input.trim()) handleSubmit(e as any);
                                    }
                                }}
                                placeholder="Posez une question réglementaire..."
                                className="max-h-32 min-h-[44px] w-full resize-none rounded-xl border border-white/10 bg-[#0f1117] px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:border-blue-500/50"
                                rows={1}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="flex shrink-0 items-center justify-center rounded-xl bg-blue-600 p-3 text-white transition-colors hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                        <p className="mt-2 text-center text-[10px] text-white/30">
                            Outil RAG à usage consultatif. Vérifiez toujours avec un juriste.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
