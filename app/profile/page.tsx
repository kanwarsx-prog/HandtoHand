import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import OfferCard from '@/components/OfferCard';

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

    // Placeholder for when no profile exists (shouldn't happen if they went through setup, but good fallback)
    const displayProfile = profile || {
        display_name: user.user_metadata?.display_name || 'User',
        email: user.email,
        bio: 'No bio add yet.',
        postcode_outward: 'UNK',
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navigation Helper */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                            ← Back to Home
                        </Link>
                        <h1 className="font-semibold text-gray-900">My Profile</h1>
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
                                    {displayProfile.display_name?.[0]?.toUpperCase()}
                                </div>
                                <div className="ml-4 mb-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{displayProfile.display_name}</h2>
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <span>📍 {displayProfile.postcode_outward}</span>
                                        <span className="mx-2">•</span>
                                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/profile/edit"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm bg-white"
                            >
                                Edit Profile
                            </Link>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">About Me</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {displayProfile.bio || "You haven't added a bio yet. Tell your neighbors about yourself!"}
                                </p>
                            </div>

                            {/* Categories/Interests could go here if we saved them to a dedicated table */}
                        </div>
                    </div>
                </div>

                {/* My Offers Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">My Offers ({myOffers?.length || 0})</h3>
                        <Link
                            href="/offers/create"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            + Create New
                        </Link>
                    </div>

                    {myOffers && myOffers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myOffers.map((offer) => (
                                <div key={offer.id} className="relative group">
                                    <OfferCard offer={offer} />
                                    <div className="absolute top-2 right-2 pointer-events-none">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold shadow-sm ${offer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {offer.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                            <p className="mb-2">You haven't posted any offers yet.</p>
                            <Link href="/offers/create" className="text-indigo-600 font-medium hover:underline">
                                Create your first offer
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
