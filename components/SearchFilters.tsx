'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, X, ChevronDown } from 'lucide-react';

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
        <div className="glass p-3 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-3 items-center animate-slide-up">

            {/* Search Bar */}
            <div className="flex-1 w-full relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors">
                    <Search size={20} />
                </span>
                <input
                    type="text"
                    placeholder="Search for items, skills, neighbors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-violet-100 rounded-xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-sm"
                />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-56 relative">
                <div className="relative">
                    <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 appearance-none bg-white/50 hover:bg-white border border-transparent rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:bg-white focus:outline-none transition-all cursor-pointer text-slate-700 font-medium shadow-sm"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                    </span>
                </div>
            </div>

            {/* Clear Filters */}
            {(search || category) && (
                <button
                    onClick={() => {
                        setSearch('');
                        setCategory('');
                        router.push(pathname);
                    }}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Clear Filters"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
}
