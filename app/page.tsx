import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import OfferCard from '@/components/OfferCard';
import SearchFilters from '@/components/SearchFilters';

// ...

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const search = params.q;
  const categoryId = params.category;

  // ... (supabase client init)

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

    // ... (rest of recommendation logic stays the same)
  }

  const { data: offers } = await query;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ... (Hero / Header sections) */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Recommendations Section */}
        {user && !search && !categoryId && recommendedOffers.length > 0 && ( // Hide recommendations when searching
          <div className="mb-12">

            {/* ... */}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            {search || categoryId ? 'Search Results' : (user ? 'Latest from your Community' : 'Latest Offers')}
          </h2>
        </div>

        <SearchFilters />

        {offers && offers.length > 0 ? (
          // ... (offers grid)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
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
      </main >
    </div >
  );
}
