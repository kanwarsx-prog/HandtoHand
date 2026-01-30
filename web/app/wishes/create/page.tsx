'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'food', name: 'Food & Cooking', icon: '🍳' },
    { id: 'gardening', name: 'Gardening', icon: '🌱' },
    { id: 'diy', name: 'DIY & Tools', icon: '🔨' },
    { id: 'skills', name: 'Skills & Teaching', icon: '📚' },
    { id: 'transport', name: 'Transport', icon: '🚗' },
    { id: 'childcare', name: 'Childcare', icon: '👶' },
    { id: 'tech', name: 'Tech & Repair', icon: '💻' },
    { id: 'arts', name: 'Arts & Crafts', icon: '🎨' },
    { id: 'books', name: 'Books', icon: '📖' },
];

export default function CreateWishPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/wishes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    description,
                    categorySlug: categoryId,
                }),
            });

            if (!response.ok) throw new Error('Failed to create wish');

            router.push('/profile');
        } catch (error: any) {
            alert('Error creating wish: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-purple-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white">Create a Wish 🌟</h1>
                        <p className="text-purple-100 mt-2">Tell neighbors what you're looking for</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                What are you looking for?
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Lawn Mower, Piano Lessons, Babysitter"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-lg"
                                required
                                maxLength={50}
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategoryId(cat.id)}
                                        className={`p-3 rounded-xl border-2 transition-all text-left flex flex-col items-center justify-center space-y-2 ${categoryId === cat.id
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-200 hover:border-purple-300 text-gray-600'
                                            }`}
                                    >
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="text-xs font-medium text-center">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what you need. Be specific about your requirements, timeline, etc."
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                                rows={5}
                                required
                                maxLength={500}
                            />
                            <p className="text-right text-xs text-gray-500 mt-1">
                                {description.length}/500
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <Link
                                href="/profile"
                                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl text-lg font-bold hover:bg-gray-300 transition-all text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-purple-600 text-white rounded-xl text-lg font-bold hover:bg-purple-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Wish...' : 'Post Wish ✨'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
