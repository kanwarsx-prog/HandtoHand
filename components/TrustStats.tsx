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
        <div className="flex gap-4">
            <div className="bg-indigo-50 rounded-lg px-4 py-2 border border-indigo-100 flex items-center gap-2">
                <span className="text-xl">🤝</span>
                <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Exchanges</p>
                    <p className="font-bold text-indigo-700">{stats.completed_count}</p>
                </div>
            </div>

            {stats.total_feedback > 0 && (
                <div className="bg-green-50 rounded-lg px-4 py-2 border border-green-100 flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Recommended</p>
                        <p className="font-bold text-green-700">{stats.recommendation_percentage}%</p>
                    </div>
                </div>
            )}
        </div>
    );
}
