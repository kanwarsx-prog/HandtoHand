import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import OfferCard from '@/components/OfferCard';
import TrustStats from '@/components/TrustStats';
import WishCard from '@/components/WishCard';

export default async function ProfilePage() {
    const cookieStore = await cookies();

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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
                    <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
                    <Link href="/auth/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user's offers
    const { data: myOffers } = await supabase
        .from('offers')
        .select(`
      *,
      category:categories(name, slug, icon)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch user's wishes
    const { data: myWishes } = await supabase
        .from('wishes')
        .select(`
      *,
      category:categories(name, slug, icon)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Placeholder for when no profile exists
    const displayProfile = profile || {
        display_name: user.user_metadata?.display_name || 'User',
        email: user.email,
        bio: '',
        postcode_outward: 'UNK',
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Cover */}
            <div className="h-48 bg-gradient-to-r from-slate-900 to-slate-800"></div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex items-end gap-6">
                                <div className="relative -mt-20">
                                    <div className="h-32 w-32 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center text-4xl font-bold text-indigo-600 bg-indigo-50">
                                        {displayProfile.display_name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="absolute bottom-2 right-2 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="pb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{displayProfile.display_name}</h1>
                                    <div className="flex items-center gap-4 text-gray-500 mt-1">
                                        <span className="flex items-center gap-1 text-sm font-medium bg-gray-100 px-2 py-1 rounded">
                                            📍 {displayProfile.postcode_outward}
                                        </span>
                                        <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto mt-4 md:mt-0">
                                <Link
                                    href="/profile/edit"
                                    className="block w-full md:w-auto text-center px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition shadow-sm"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {displayProfile.bio || "No bio added yet."}
                                </p>

                                <TrustStats userId={user.id} />
                            </div>

                            {/* Future: Sidebar stats or badges could go here */}
                        </div>
                    </div>
                </div>

                {/* Content Tabs / Sections */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">My Offers</h2>
                        <Link
                            href="/offers/create"
                            className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
                        >
                            <span>+</span> Create New
                        </Link>
                    </div>

                    {myOffers && myOffers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myOffers.map((offer) => (
                                <OfferCard key={offer.id} offer={offer} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <div className="text-4xl mb-4">📦</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No offers yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start building your reputation by offering something useful to your neighbors.</p>
                            <Link
                                href="/offers/create"
                                className="inline-block px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
                            >
                                Create Offer
                            </Link>
                        </div>
                    )}
                </div>

                {/* My Wishes Section */}
                <div className="space-y-6 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">My Wishes</h2>
                        <Link
                            href="/wishes/create"
                            className="inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
                        >
                            <span>+</span> Create New
                        </Link>
                    </div>

                    {myWishes && myWishes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myWishes.map((wish) => (
                                <WishCard key={wish.id} wish={wish} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                            <div className="text-4xl mb-4">✨</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No wishes yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Looking for something? Let your neighbors know what you need help with.</p>
                            <Link
                                href="/wishes/create"
                                className="inline-block px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition"
                            >
                                Create Wish
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
