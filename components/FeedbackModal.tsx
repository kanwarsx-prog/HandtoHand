'use client';

import { useState } from 'react';

interface FeedbackModalProps {
    exchangeId: string;
    partnerName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FeedbackModal({ exchangeId, partnerName, onClose, onSuccess }: FeedbackModalProps) {
    const [wouldExchangeAgain, setWouldExchangeAgain] = useState<boolean | null>(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (wouldExchangeAgain === null) return;

        setSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exchange_id: exchangeId,
                    would_exchange_again: wouldExchangeAgain,
                    comment
                })
            });

            if (response.ok) {
                onSuccess();
            } else {
                alert('Failed to submit feedback');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🤝</div>
                    <h2 className="text-2xl font-bold text-gray-900">Exchange Complete!</h2>
                    <p className="text-gray-600 mt-2">
                        How did it go with <span className="font-semibold">{partnerName}</span>?
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 mb-6">
                        <p className="text-sm font-medium text-gray-700 text-center">Would you exchange with them again?</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setWouldExchangeAgain(true)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${wouldExchangeAgain === true
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                                    }`}
                            >
                                <span className="text-2xl">👍</span>
                                <span className="font-bold text-sm">Yes</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setWouldExchangeAgain(false)}
                                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${wouldExchangeAgain === false
                                    ? 'border-red-500 bg-red-50 text-red-700'
                                    : 'border-gray-200 hover:border-red-200 hover:bg-red-50'
                                    }`}
                            >
                                <span className="text-2xl">👎</span>
                                <span className="font-bold text-sm">No</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Optional Comment
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Any tips for others?"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                        >
                            Skip
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || wouldExchangeAgain === null}
                            className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Sending...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
