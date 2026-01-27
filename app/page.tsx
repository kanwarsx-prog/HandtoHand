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
    <div className="min-h-screen bg-stone-50 overflow-x-hidden relative">

      {/* Organic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-[600px] -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-teal-200/40 rounded-full blur-[100px] mix-blend-multiply animate-fade-in delay-100"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[120px] mix-blend-multiply animate-fade-in delay-200"></div>
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[100px] mix-blend-multiply animate-fade-in delay-300"></div>
      </div>

      {/* Hero Section */}
      <div className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center md:text-left relative z-10">
        {!user ? (
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight animate-slide-up">
              Share more.<br /> <span className="text-teal-600">Waste less.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-slide-up delay-100">
              Connect with your local community to swap skills, tools, and leftovers. No money, just kindness.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-slide-up">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-800">
                Hello, <span className="text-teal-600">{user.user_metadata?.display_name || 'Neighbor'}</span>! 👋
              </h1>
              <p className="text-lg text-slate-600 mt-2">
                Here's what your community is sharing today.
              </p>
            </div>
            <NotificationBell />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">

        {/* Search floating over content */}
        <div className="-mt-4 mb-12 relative z-20">
          <Suspense fallback={<div className="h-20 bg-white/50 backdrop-blur rounded-2xl animate-pulse"></div>}>
            <SearchFilters />
          </Suspense>
        </div>

        {/* Recommendations */}
        {user && !search && !categoryId && recommendedOffers.length > 0 && (
          <div className="mb-16 animate-slide-up delay-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-xl shadow-inner">
                ✨
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-800">Suggested for you</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedOffers.map((offer, i) => (
                <div key={offer.id} className="animate-scale-pop" style={{ animationDelay: `${i * 100}ms` }}>
                  <OfferCard offer={offer} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Offers Feed */}
        <div className="flex items-center gap-3 mb-8 animate-slide-up delay-300">
          <h2 className="text-2xl font-display font-bold text-slate-800">
            {search || categoryId ? 'Search Results' : (user ? 'Latest from your Community' : 'Latest Offers')}
          </h2>
          <div className="h-px bg-slate-200 flex-1 ml-4 opacity-50"></div>
        </div>

        {offers && offers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(0,1fr)]">
            {offers.map((offer, i) => (
              <div key={offer.id} className="animate-fade-in" style={{ animationDelay: `${(i % 5) * 100}ms` }}>
                <OfferCard offer={offer} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 animate-slide-up">
            <div className="text-6xl mb-6 opacity-80">🍃</div>
            <h3 className="text-2xl font-display font-bold text-slate-800 mb-2">No offers found</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              We couldn't find anything matching your search. Why not be the first to post something?
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              >
                Clear Search
              </Link>
              <Link
                href="/offers/create"
                className="px-6 py-2.5 rounded-full bg-teal-500 text-white font-bold hover:bg-teal-600 shadow-lg shadow-teal-500/30 transition-all hover:shadow-teal-500/50 hover:-translate-y-0.5"
              >
                Post an Offer
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
