'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [postcode, setPostcode] = useState('');
    const [bio, setBio] = useState('');
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setDisplayName(profile.display_name || '');
                setPostcode(profile.postcode_full || '');
                setBio(profile.bio || '');
            }
            setLoading(false);
        }

        loadProfile();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

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
                    // We're not sending categories here yet, but the API handles partial updates for now
                    // or we can add category selection here too
                }),
            });

            if (!response.ok) throw new Error('Failed to update profile');

            router.push('/profile');
            router.refresh(); // Refresh the server component
        } catch (error) {
            alert('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navigation Helper */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link href="/profile" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                            Cancel
                        </Link>
                        <h1 className="font-semibold text-gray-900">Edit Profile</h1>
                        <button
                            form="profile-form"
                            type="submit"
                            disabled={saving}
                            className="text-sm font-bold text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Postcode
                                </label>
                                <input
                                    type="text"
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
                                    required
                                    maxLength={8}
                                />
                                <p className="mt-1 text-xs text-gray-500">Only the first part (e.g. SW1) is shown to others.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                    placeholder="Tell your neighbors about yourself..."
                                    required
                                    maxLength={500}
                                />
                                <p className="text-right text-xs text-gray-500 mt-1">
                                    {bio.length}/500
                                </p>
                            </div>

                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Want to change your interests? <br />
                            <Link href="/profile/setup" className="text-indigo-600 hover:underline">
                                Run the setup wizard again
                            </Link>
                        </p>
                    </div>

                </form>
            </main>
        </div>
    );
}
