'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

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
    partner?: any;
    offer?: any;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch initial messages
    useEffect(() => {
        async function fetchMessages() {
            console.log('Fetching messages for conversation:', conversationId);
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            console.log('Messages fetch result:', { data, error });

            if (data) {
                setMessages(data);
                scrollToBottom();
            }
        }

        fetchMessages();

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
    }, [conversationId, supabase]);

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic update
        // const tempId = Math.random().toString();
        // setMessages(prev => [...prev, { id: tempId, sender_id: currentUser.id, content: newMessage, created_at: new Date().toISOString() }]);

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

    return (
        <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
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
