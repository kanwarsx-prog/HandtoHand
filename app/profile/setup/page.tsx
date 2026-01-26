'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

type Step = 'welcome' | 'name' | 'location' | 'bio' | 'categories' | 'complete';

const CATEGORIES = [
    { id: '1', name: 'Food & Cooking', icon: '🍳', slug: 'food' },
    { id: '2', name: 'Gardening', icon: '🌱', slug: 'gardening' },
    { id: '3', name: 'DIY & Tools', icon: '🔨', slug: 'diy' },
    { id: '4', name: 'Skills & Teaching', icon: '📚', slug: 'skills' },
    { id: '5', name: 'Transport', icon: '🚗', slug: 'transport' },
    { id: '6', name: 'Childcare', icon: '👶', slug: 'childcare' },
    { id: '7', name: 'Tech & Repair', icon: '💻', slug: 'tech' },
    { id: '8', name: 'Arts & Crafts', icon: '🎨', slug: 'arts' },
];

export default function ProfileSetupPage() {
    const [step, setStep] = useState<Step>('welcome');
    const [displayName, setDisplayName] = useState('');
    const [postcode, setPostcode] = useState('');
    const [bio, setBio] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleComplete = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    displayName,
                    postcode,
                    bio,
                    categories: selectedCategories,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save profile');
            }

            setStep('complete');
        } catch (error: any) {
            alert('Error saving profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Welcome Step
    if (step === 'welcome') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
                <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
                    <div className="space-y-4">
                        <div className="text-6xl animate-bounce">👋</div>
                        <h1 className="text-5xl font-bold text-gray-900">
                            Welcome to HandtoHand!
                        </h1>
                        <p className="text-xl text-gray-600">
                            Let's set up your profile so you can start exchanging with your local community
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl">
                        <p className="text-gray-700 mb-6">
                            This will only take a minute. We'll ask you about:
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">📍</span>
                                <span className="text-gray-700">Your location</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">✨</span>
                                <span className="text-gray-700">Your interests</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">💬</span>
                                <span className="text-gray-700">A bit about you</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">🎯</span>
                                <span className="text-gray-700">What you offer</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setStep('name')}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-full text-lg font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                    >
                        Let's get started! 🚀
                    </button>
                </div>
            </div>
        );
    }

    // Name Step
    if (step === 'name') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
                <div className="max-w-xl w-full space-y-8 animate-slide-in">
                    <div className="text-center space-y-2">
                        <div className="text-5xl mb-4">👤</div>
                        <h2 className="text-3xl font-bold text-gray-900">What should we call you?</h2>
                        <p className="text-gray-600">This is how others will see you on HandtoHand</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl space-y-6">
                        <div>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name..."
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                autoFocus
                            />
                            {displayName && (
                                <p className="mt-3 text-sm text-gray-600 animate-fade-in">
                                    Great! Nice to meet you, <span className="font-semibold text-indigo-600">{displayName}</span> ✨
                                </p>
                            )}
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep('welcome')}
                                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep('location')}
                                disabled={!displayName.trim()}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Location Step
    if (step === 'location') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
                <div className="max-w-xl w-full space-y-8 animate-slide-in">
                    <div className="text-center space-y-2">
                        <div className="text-5xl mb-4">📍</div>
                        <h2 className="text-3xl font-bold text-gray-900">Where are you based?</h2>
                        <p className="text-gray-600">We'll use this to show you local exchanges nearby</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your postcode
                            </label>
                            <input
                                type="text"
                                value={postcode}
                                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                                placeholder="e.g., SW1A 1AA"
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all uppercase"
                                autoFocus
                                maxLength={8}
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                🔒 We only show your postcode area (e.g., SW1A) to others for privacy
                            </p>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep('name')}
                                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep('bio')}
                                disabled={postcode.length < 5}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Bio Step
    if (step === 'bio') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
                <div className="max-w-xl w-full space-y-8 animate-slide-in">
                    <div className="text-center space-y-2">
                        <div className="text-5xl mb-4">💬</div>
                        <h2 className="text-3xl font-bold text-gray-900">Tell us about yourself</h2>
                        <p className="text-gray-600">What makes you unique? What do you love doing?</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl space-y-6">
                        <div>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="I love gardening and cooking. Always happy to share vegetables from my garden or teach someone how to bake sourdough! 🌱🍞"
                                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                                rows={5}
                                autoFocus
                                maxLength={500}
                            />
                            <div className="flex justify-between mt-2">
                                <p className="text-xs text-gray-500">
                                    💡 Tip: Mention your skills, hobbies, or what you're looking for
                                </p>
                                <p className="text-xs text-gray-500">
                                    {bio.length}/500
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep('location')}
                                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep('categories')}
                                disabled={bio.length < 20}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Categories Step
    if (step === 'categories') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
                <div className="max-w-2xl w-full space-y-8 animate-slide-in">
                    <div className="text-center space-y-2">
                        <div className="text-5xl mb-4">✨</div>
                        <h2 className="text-3xl font-bold text-gray-900">What are you interested in?</h2>
                        <p className="text-gray-600">Select all that apply - you can change these later</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => toggleCategory(category.id)}
                                    className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${selectedCategories.includes(category.id)
                                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                        : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{category.icon}</div>
                                    <div className="font-medium text-gray-900">{category.name}</div>
                                </button>
                            ))}
                        </div>

                        {selectedCategories.length > 0 && (
                            <p className="text-center text-sm text-gray-600 animate-fade-in">
                                Great! You've selected {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'} 🎯
                            </p>
                        )}

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={() => setStep('bio')}
                                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={selectedCategories.length === 0 || loading}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all"
                            >
                                {loading ? 'Saving...' : 'Complete Setup! 🎉'}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Complete Step
    if (step === 'complete') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
                <div className="max-w-xl w-full text-center space-y-8 animate-scale-in">
                    <div className="space-y-4">
                        <div className="text-7xl animate-bounce">🎉</div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            You're all set!
                        </h1>
                        <p className="text-xl text-gray-600">
                            Welcome to the HandtoHand community, {displayName}!
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur rounded-2xl p-8 shadow-xl space-y-4">
                        <h3 className="font-semibold text-gray-900 text-lg">What's next?</h3>
                        <div className="space-y-3 text-left">
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">🎁</span>
                                <div>
                                    <p className="font-medium text-gray-900">Create your first offer</p>
                                    <p className="text-sm text-gray-600">Share what you can offer to the community</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">🔍</span>
                                <div>
                                    <p className="font-medium text-gray-900">Browse local offers</p>
                                    <p className="text-sm text-gray-600">See what's available in your area</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <span className="text-2xl">💬</span>
                                <div>
                                    <p className="font-medium text-gray-900">Start exchanging</p>
                                    <p className="text-sm text-gray-600">Connect with neighbors and make your first exchange</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-full text-lg font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                    >
                        Go to Dashboard →
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
