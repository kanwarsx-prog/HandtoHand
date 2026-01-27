'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MessageButton({
    recipientId,
    offerId,
    recipientName
}: {
    recipientId: string,
    offerId?: string,
    recipientName: string
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleMessage = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user2_id: recipientId,
                    offer_id: offerId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to start conversation');
            }

            const { conversation } = await response.json();

            // Redirect to the chat page
            router.push(`/messages/${conversation.id}`);

        } catch (error) {
            alert('Error starting chat');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleMessage}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? 'Starting Chat...' : `Message ${recipientName} 💬`}
        </button>
    );
}
