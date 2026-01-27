'use client';

import { useState, useEffect } from 'react';

export default function TrustStats({ userId }: { userId: string }) {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`/api/users/${userId}/stats`);
                const data = await res.json();
                if (data.stats) {
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        }
        fetchStats();
    }, [userId]);

    if (!stats) return null;

    return (
        <div className="flex items-center gap-8 py-4 border-t border-gray-100 mt-6">
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">{stats.completed_count}</span>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Exchanges</span>
            </div>

            <div className="w-px h-8 bg-gray-200"></div>

            {stats.total_feedback > 0 ? (
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-green-600">{stats.recommendation_percentage}%</span>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended</span>
                </div>
            ) : (
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-gray-400">-</span>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">No Ratings</span>
                </div>
            )}
        </div>
    );
}
