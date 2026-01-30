import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import OfferCard from '@/components/OfferCard';
import MessageButton from '@/components/MessageButton';

export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const cookieStore = await cookies();
    const { userId } = await params;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // If viewing own profile, redirect to /profile
    if (currentUser?.id === userId) {
        redirect('/profile');
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, display_name, bio, postcode_outward, created_at')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
                    <p className="text-gray-600 mb-6">This user profile doesn't exist or has been removed.</p>
                    <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch user's active offers
    const { data: activeOffers } = await supabase
        .from('offers')
        .select(`
            *,
            category:categories(name, slug, icon),
            user:users(id, display_name)
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false });

    // Fetch user's completed offers (for exchange history)
    const { data: completedOffers } = await supabase
        .from('offers')
        .select(`
            *,
            category:categories(name, slug, icon),
            user:users(id, display_name)
        `)
        .eq('user_id', userId)
        .neq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(6);

    // Count conversations (as proxy for exchanges)
    const { count: conversationCount } = await supabase
        .from('conversation_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navigation Helper */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                            ← Back
                        </Link>
                        <h1 className="font-semibold text-gray-900">User Profile</h1>
                        <div className="w-20"></div> {/* Spacer for centering */}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="flex items-end">
                                <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-3xl font-bold text-indigo-600 bg-indigo-50">
                                    {profile.display_name?.[0]?.toUpperCase()}
                                </div>
                                <div className="ml-4 mb-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{profile.display_name}</h2>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <span>📍 {profile.postcode_outward}</span>
                                        <span className="mx-2">•</span>
                                        <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>
                            {currentUser && (
                                <MessageButton
                                    recipientId={userId}
                                    recipientName={profile.display_name || 'User'}
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">About</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {profile.bio || "This user hasn't added a bio yet."}
                                </p>
                            </div>

                            {/* Exchange Stats */}
                            {conversationCount !== null && conversationCount > 0 && (
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🤝</span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {conversationCount} {conversationCount === 1 ? 'Exchange' : 'Exchanges'}
                                            </p>
                                            <p className="text-xs text-gray-500">Active conversations</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Offers Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">
                            Active Offers ({activeOffers?.length || 0})
                        </h3>
                    </div>

                    {activeOffers && activeOffers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeOffers.map((offer) => (
                                <OfferCard key={offer.id} offer={offer} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                            <p>No active offers at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Previous Exchanges / Completed Offers Section */}
                {completedOffers && completedOffers.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">
                                Previous Activity
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedOffers.map((offer) => (
                                <div key={offer.id} className="relative">
                                    <OfferCard offer={offer} />
                                    <div className="absolute top-2 right-2 pointer-events-none">
                                        <span className="text-[10px] px-2 py-1 rounded-full font-bold shadow-sm bg-gray-100 text-gray-600">
                                            COMPLETED
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
