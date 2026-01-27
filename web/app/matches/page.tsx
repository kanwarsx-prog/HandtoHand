'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MatchesPage() {
    const [matches, setMatches] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMatches() {
            try {
                const response = await fetch('/api/matches');
                const data = await response.json();
                setMatches(data.matches);
            } catch (error) {
                console.error('Error fetching matches:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMatches();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Finding your matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Your Matches 🎯</h1>
                    <p className="text-gray-600 mt-2">Discover potential exchanges based on your offers and wishes</p>
                </div>

                {/* Reciprocal Matches */}
                {matches?.reciprocalMatches && matches.reciprocalMatches.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-purple-600 mb-4">🌟 Perfect Matches (Mutual Interest!)</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {matches.reciprocalMatches.map((match: any, idx: number) => (
                                <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-3xl font-bold text-purple-600">{Math.round(match.score)}%</span>
                                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">RECIPROCAL</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-600">They offer:</p>
                                            <p className="font-bold text-gray-900">{match.offer?.title}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">You want:</p>
                                            <p className="font-bold text-gray-900">{match.wish?.title}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {match.reasons.map((reason: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-white text-purple-700 text-xs rounded-full border border-purple-200">
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                        <Link
                                            href={`/offers/${match.offer?.id}`}
                                            className="block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-center font-bold hover:bg-purple-700 transition"
                                        >
                                            View Offer & Message
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Offers for Your Wishes */}
                {matches?.offersForWishes && matches.offersForWishes.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-indigo-600 mb-4">💎 Offers You Might Want</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {matches.offersForWishes.map((match: any, idx: number) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xl font-bold text-indigo-600">{Math.round(match.score)}%</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{match.offer?.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">By {match.offer?.user?.display_name}</p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {match.reasons.slice(0, 2).map((reason: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                    <Link
                                        href={`/offers/${match.offer?.id}`}
                                        className="block px-3 py-2 bg-indigo-600 text-white rounded-lg text-center text-sm font-bold hover:bg-indigo-700 transition"
                                    >
                                        View Offer
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* People Who Want Your Offers */}
                {matches?.wishesForOffers && matches.wishesForOffers.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-green-600 mb-4">🎁 People Who Want Your Offers</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {matches.wishesForOffers.map((match: any, idx: number) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xl font-bold text-green-600">{Math.round(match.score)}%</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">{match.wish?.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">Wanted by {match.wish?.user?.display_name}</p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {match.reasons.slice(0, 2).map((reason: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Your offer: {match.offer?.title}</p>
                                    <Link
                                        href={`/offers/${match.offer?.id}`}
                                        className="block px-3 py-2 bg-green-600 text-white rounded-lg text-center text-sm font-bold hover:bg-green-700 transition"
                                    >
                                        View Your Offer
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Matches */}
                {(!matches?.reciprocalMatches || matches.reciprocalMatches.length === 0) &&
                    (!matches?.offersForWishes || matches.offersForWishes.length === 0) &&
                    (!matches?.wishesForOffers || matches.wishesForOffers.length === 0) && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No matches yet</h3>
                            <p className="text-gray-600 mb-6">
                                Create more offers and wishes to find potential exchanges!
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link href="/offers/create" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                                    Post Offer
                                </Link>
                                <Link href="/wishes/create" className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">
                                    Post Wish
                                </Link>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
}
