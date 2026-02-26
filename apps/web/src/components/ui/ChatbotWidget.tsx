'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
}

interface ChatbotWidgetProps {
    /** When true, renders the chat inline (no floating button) - for Settings page */
    embedded?: boolean;
}

export function ChatbotWidget({ embedded = false }: ChatbotWidgetProps) {
    // Affiche par défaut en mode widget (layout protégé = utilisateur connecté)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!embedded);
    const [isOpen, setIsOpen] = useState(embedded);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: 'Bonjour ! Je suis l\'assistant juridique expert de CONFORM+. Comment puis-je vous aider avec vos obligations de conformité aujourd\'hui ?',
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Met à jour la visibilité si l'utilisateur se déconnecte
    useEffect(() => {
        const supabase = createClient();
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
        };
        checkSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkSession());
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Ne pas afficher si non connecte (sauf en mode embedded)
    if (!embedded && !isAuthenticated) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Appel API Proxy vers Mistral (NestJS)
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
            const res = await fetch(`${apiUrl}/chatbot/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const msg = errData?.message || `Erreur ${res.status}`;
                throw new Error(msg);
            }

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
            {/* Bouton Widget Flottant - masqué en mode embedded */}
            {!embedded && !isOpen && (
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
                        <Bot className="h-7 w-7 text-white" />
                    </div>
                </button>
            )}

            {/* Interface de Chat - fixed en mode widget, inline en mode embedded */}
            {isOpen && (
                <div className={embedded
                    ? "flex h-[500px] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                    : "fixed bottom-6 right-6 z-[2147483647] flex h-[600px] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-[#white/10] bg-[#1a1f28] shadow-2xl sm:bottom-8 sm:right-8 transition-all animate-in slide-in-from-bottom-5"
                }>
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
                        {!embedded && (
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
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
