'use client';

import { useState } from 'react';

interface Exchange {
    id: string;
    status: 'PROPOSED' | 'AGREED' | 'COMPLETED' | 'CANCELLED';
    initiator_id: string;
    responder_id: string;
    initiator_offer?: string;
    responder_offer?: string;
    initiator_confirmed: boolean;
    responder_confirmed: boolean;
}

interface ExchangeStatusCardProps {
    exchange: Exchange;
    currentUserId: string;
    onUpdate: () => void;
}

export default function ExchangeStatusCard({ exchange, currentUserId, onUpdate }: ExchangeStatusCardProps) {
    const [loading, setLoading] = useState(false);

    // Determine my role and status
    const isInitiator = exchange.initiator_id === currentUserId;
    const isResponder = !isInitiator;

    const handleAction = async (action: 'AGREE' | 'COMPLETE' | 'CANCEL') => {
        setLoading(true);
        try {
            const response = await fetch(`/api/exchanges/${exchange.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (response.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error('Exchange action failed', error);
        } finally {
            setLoading(false);
        }
    };

    if (exchange.status === 'CANCELLED') return null;

    if (exchange.status === 'COMPLETED') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <h3 className="font-bold text-green-800">Exchange Completed!</h3>
                <p className="text-green-600 text-sm">You've successfully helped each other.</p>
                {/* Future: Add 'Leave Feedback' button here */}
            </div>
        );
    }

    if (exchange.status === 'AGREED') {
        const myConfirmation = isInitiator ? exchange.initiator_confirmed : exchange.responder_confirmed;
        const otherConfirmation = isInitiator ? exchange.responder_confirmed : exchange.initiator_confirmed;

        return (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-blue-800">🤝 Exchange Agreed</h3>
                    <span className="text-xs font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">In Progress</span>
                </div>

                <div className="text-sm text-blue-900 mb-4">
                    <p>When you have met up and exchanged items/help, tap the button below.</p>
                </div>

                <div className="flex flex-col gap-2">
                    {myConfirmation ? (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-center text-sm font-medium">
                            ✓ You confirmed completion
                        </div>
                    ) : (
                        <button
                            onClick={() => handleAction('COMPLETE')}
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                        >
                            Mark as Completed
                        </button>
                    )}

                    {otherConfirmation && (
                        <div className="text-xs text-center text-gray-500 italic">
                            Partner has confirmed. Waiting for you...
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (exchange.status === 'PROPOSED') {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-amber-800">🤚 Exchange Proposed</h3>
                    <span className="text-xs bg-amber-100 px-2 py-1 rounded text-amber-800">Proposal</span>
                </div>

                <div className="text-sm text-amber-900 mb-4">
                    <p><strong>{isInitiator ? 'You' : 'Partner'} proposed:</strong></p>
                    <ul className="list-disc pl-4 mt-1">
                        <li>{exchange.initiator_offer || 'Their Offer'}</li>
                        <li>for</li>
                        <li>{exchange.responder_offer || 'Your Item'}</li>
                    </ul>
                </div>

                {isResponder ? (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction('AGREE')}
                            disabled={loading}
                            className="flex-1 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleAction('CANCEL')}
                            disabled={loading}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Decline
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-xs text-gray-500 italic mb-2">Waiting for partner to accept...</p>
                        <button
                            onClick={() => handleAction('CANCEL')}
                            disabled={loading}
                            className="text-gray-400 hover:text-red-500 text-xs underline"
                        >
                            Cancel Proposal
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return null;
}
