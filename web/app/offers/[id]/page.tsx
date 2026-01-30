import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import DeleteOfferButton from '@/components/DeleteOfferButton';
import MessageButton from '@/components/MessageButton';

export default async function OfferDetailsPage({ params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const { id } = await params;

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

    const { data: offer, error } = await supabase
        .from('offers')
        .select(`
      *,
      category:categories(name, slug, icon),
      user:users(id, display_name, postcode_outward, email)
    `)
        .eq('id', id)
        .single();

    if (error || !offer) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h1>
                <p className="text-gray-600 mb-6">This offer may have been removed or doesn't exist.</p>
                <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    Back to Home
                </Link>
            </div>
        );
    }

    const isOwner = user?.id === offer.user_id;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navigation Helper */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                            ← Back to offers
                        </Link>
                        <h1 className="font-semibold text-gray-900 truncate max-w-xs">{offer.title}</h1>
                        <div className="w-20"></div> {/* Spacer */}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Image or Placeholder */}
                    {offer.image_url ? (
                        <div className="h-96 w-full bg-gray-100">
                            <img
                                src={offer.image_url}
                                alt={offer.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="h-64 bg-gray-100 flex items-center justify-center text-6xl text-gray-400">
                            {offer.category?.icon || '📦'}
                        </div>
                    )}

                    <div className="p-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 mb-2">
                                    {offer.category?.name}
                                </span>
                                <h1 className="text-3xl font-bold text-gray-900">{offer.title}</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Posted {new Date(offer.created_at).toLocaleDateString()} in {offer.user?.postcode_outward || 'Local Area'}
                                </p>
                            </div>
                            {isOwner && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    Your Offer
                                </span>
                            )}
                        </div>

                        <div className="prose prose-indigo max-w-none mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {offer.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center bg-gray-50 rounded-xl p-6">
                            <div className="flex items-center mb-4 sm:mb-0">
                                {offer.user?.id ? (
                                    <Link
                                        href={`/profile/${offer.user.id}`}
                                        className="flex items-center hover:opacity-80 transition-opacity"
                                    >
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                            {offer.user?.display_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Offered by {offer.user?.display_name}</p>
                                            <p className="text-xs text-gray-500">Member since {new Date().getFullYear()}</p>
                                        </div>
                                    </Link>
                                ) : (
                                    <>
                                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                            {offer.user?.display_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">Offered by {offer.user?.display_name}</p>
                                            <p className="text-xs text-gray-500">Member since {new Date().getFullYear()}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {!isOwner ? (
                                <MessageButton
                                    recipientId={offer.user_id}
                                    offerId={offer.id}
                                    recipientName={offer.user?.display_name || 'User'}
                                />
                            ) : (
                                <div className="flex gap-3">
                                    <Link
                                        href={`/offers/${offer.id}/edit`}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-md"
                                    >
                                        Edit Offer ✏️
                                    </Link>
                                    <DeleteOfferButton offerId={offer.id} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
