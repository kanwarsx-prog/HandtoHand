

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import OfferCard from '@/components/OfferCard';

export default async function Home() {
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

  // Fetch offers with author and category info
  let query = supabase
    .from('offers')
    .select(`
      *,
      category:categories(name, slug, icon),
      user:users(display_name, profile_photo)
    `)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  // If logged in, exclude own offers
  if (user) {
    query = query.neq('user_id', user.id);
  }

  const { data: offers } = await query;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
                <span>🤝</span> HandtoHand
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    href="/matches"
                    className="px-4 py-2 text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    🎯 Matches
                  </Link>
                  <Link
                    href="/messages"
                    className="px-4 py-2 text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    💬 Messages
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/wishes/create"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    + Post Wish
                  </Link>
                  <Link
                    href="/offers/create"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    + Post Offer
                  </Link>
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </>
              ) : (
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Show only for non-logged in users */}
      {!user ? (
        <div className="bg-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Exchange Skills & Items Locally</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Join your neighbors in swapping gardening tips, tools, cooking, and more. No money, just community.
            </p>
          </div>
        </div>
      ) : (
        /* Dashboard Header for Logged In Users */
        <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.user_metadata?.display_name || 'Neighbor'}! 👋
              </h1>
              <p className="text-gray-500 mt-1">
                Here's what's happening in your local community today.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/profile"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 px-3 py-2"
              >
                View Profile
              </Link>
              {/* Future: Add 'My Offers' link here */}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? 'Latest from your Community' : 'Latest Offers'}
          </h2>
          <div className="flex gap-2">
            {/* Filter buttons could go here */}
          </div>
        </div>

        {offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active offers found</h3>
            <p className="text-gray-500 mb-6">
              {user
                ? "There are no offers from your neighbors yet. Check back soon!"
                : "Be the first to share something with your community!"}
            </p>
            {!user && (
              <Link
                href="/offers/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create First Offer
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
