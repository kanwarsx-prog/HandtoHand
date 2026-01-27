'use client';

import { useEffect, useState } from 'react';
import { seedCategories } from '@/lib/seed';

export default function SeedPage() {
    const [status, setStatus] = useState('Idle');

    const runSeed = async () => {
        setStatus('Seeding...');
        await seedCategories();
        setStatus('Done! Check console for details.');
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <button
                onClick={runSeed}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
                Seed Categories
            </button>
            <p className="mt-4">{status}</p>
        </div>
    );
}
