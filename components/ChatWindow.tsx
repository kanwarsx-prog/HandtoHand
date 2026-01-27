'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import ExchangeStatusCard from './ExchangeStatusCard';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export default function ChatWindow({
    conversationId,
    currentUser,
    partner,
    offer
}: {
    conversationId: string;
    currentUser: any;
    partner: any;
    offer?: any;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [exchange, setExchange] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch exchange status
    const fetchExchange = async () => {
        if (!partner) return;
        try {
            const res = await fetch(`/api/exchanges?partner_id=${partner.id}`);
            const data = await res.json();
            if (data.exchange) {
                setExchange(data.exchange);
            }
        } catch (error) {
            console.error('Error fetching exchange:', error);
        }
    };

    // Fetch initial messages and exchange
    useEffect(() => {
        async function fetchMessages() {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data);
                scrollToBottom();
            }
        }

        fetchMessages();
        fetchExchange();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('realtime messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload) => {
                    setMessages((current) => [...current, payload.new as Message]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, supabase, partner?.id]);

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    content: newMessage
                })
            });

            if (!response.ok) throw new Error('Failed to send');

            setNewMessage('');
        } catch (error) {
            console.error(error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleProposeExchange = async () => {
        if (!confirm('Propose an official exchange with this user?')) return;

        try {
            const response = await fetch('/api/exchanges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    partner_id: partner.id,
                    offer_id: offer?.id,
                    offer_title: offer?.title || 'Help/Item',
                    wish_title: 'Something in return' // Simple default for now
                })
            });

            const data = await response.json();
            if (response.ok) {
                setExchange(data.exchange);
                // Optionally send a system message
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error proposing exchange:', error);
        }
    };

    return (
        <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            {/* Exchange Status Header */}
            <div className="bg-white border-b border-gray-100 p-4">
                {exchange ? (
                    <ExchangeStatusCard
                        exchange={exchange}
                        currentUserId={currentUser.id}
                        onUpdate={fetchExchange}
                    />
                ) : (
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Exchange Proposal</p>
                            <p className="text-xs text-gray-500">Ready to commit to a swap?</p>
                        </div>
                        <button
                            onClick={handleProposeExchange}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm"
                        >
                            Propose Exchange 🤝
                        </button>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMe
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                } shadow-sm`}>
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
