'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SearchFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');

    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase
                .from('categories')
                .select('id, name, icon')
                .order('order');
            if (data) setCategories(data);
        }
        fetchCategories();
    }, []);

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            updateParams('q', search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const updateParams = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(pathname + '?' + params.toString());
    }, [searchParams, router, pathname]);

    const handleCategoryChange = (val: string) => {
        setCategory(val);
        updateParams('category', val);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">

            {/* Search Bar */}
            <div className="flex-1 w-full relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder="Search offers (e.g. 'drill', 'gardening')..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48">
                <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Clear Filters */}
            {(search || category) && (
                <button
                    onClick={() => {
                        setSearch('');
                        setCategory('');
                        router.push(pathname);
                    }}
                    className="text-sm text-gray-500 hover:text-red-500 whitespace-nowrap px-2"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}
