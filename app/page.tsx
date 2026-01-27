import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import OfferCard from '@/components/OfferCard';
import SearchFilters from '@/components/SearchFilters';
import NotificationBell from '@/components/NotificationBell';
import { findOffersForWishes } from '@/lib/matching';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const search = params.q;
  const categoryId = params.category;

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

  // Apply Search Filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  // If logged in, exclude own offers and fetch wishes for recommendations
  let recommendedOffers: any[] = [];

  if (user) {
    query = query.neq('user_id', user.id);

    // Fetch user's wishes for recommendations
    const { data: wishes } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE');

    // Fetch ALL active offers for matching (we need them in memory to run the algorithm)
    // Note: optimization would be to do this in DB, but for MVP JS algorithm is fine
    const { data: allOffers } = await supabase
      .from('offers')
      .select(`
            *,
            category:categories(name, slug, icon),
            user:users(display_name, profile_photo, postcode_outward)
        `)
      .eq('status', 'ACTIVE')
      .neq('user_id', user.id);

    if (wishes && allOffers) {
      // We need to cast types or ensure matching.ts accepts the Supabase return types
      const matches = findOffersForWishes(
        wishes as any[],
        allOffers as any[],
        user.user_metadata?.postcode_outward
      );
      recommendedOffers = matches.slice(0, 4).map(m => m.offer);
    }
  }

  const { data: offers } = await query;

  return (
    <div className="min-h-screen bg-gray-50">

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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome back, {user.user_metadata?.display_name || 'Neighbor'}! 👋
              </h1>
              <p className="text-indigo-100 mt-2 text-lg">
                Here's what's happening in your local community today.
              </p>
            </div>
            <NotificationBell />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Recommendations Section - Hide when searching or filtering */}
        {user && !search && !categoryId && recommendedOffers.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✨</span>
              <h2 className="text-xl font-bold text-gray-900">Suggested for you</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
            <div className="my-8 border-b border-gray-200"></div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            {search || categoryId ? 'Search Results' : (user ? 'Latest from your Community' : 'Latest Offers')}
          </h2>
        </div>

        <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-xl mb-6"></div>}>
          <SearchFilters />
        </Suspense>

        {offers && offers.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {offers.map((offer) => (
              <div key={offer.id} className="break-inside-avoid">
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching offers found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters.
            </p>
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear all filters
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
