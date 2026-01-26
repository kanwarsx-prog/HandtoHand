import Link from 'next/link';

interface Offer {
    id: string;
    title: string;
    description: string;
    category: {
        icon: string;
        name: string;
    } | null;
    user: {
        display_name: string;
    } | null;
    created_at: string;
}

const CATEGORY_ICONS: Record<string, string> = {
    food: '🍳',
    gardening: '🌱',
    diy: '🔨',
    skills: '📚',
    transport: '🚗',
    childcare: '👶',
    tech: '💻',
    arts: '🎨',
};

export default function OfferCard({ offer }: { offer: any }) {
    // Helper to safely get icon
    const getIcon = (slug: string) => CATEGORY_ICONS[slug] || '📦';

    return (
        <Link
            href={`/offers/${offer.id}`}
            className="block group"
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                {/* Image or Placeholder */}
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {offer.image_url ? (
                        <img
                            src={offer.image_url}
                            alt={offer.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="text-4xl group-hover:scale-105 transition-transform duration-300">
                            {offer.category?.icon || getIcon(offer.category?.slug)}
                        </div>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {offer.category?.name || 'Item'}
                        </span>
                        <span className="text-xs text-gray-400">
                            {new Date(offer.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {offer.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {offer.description}
                    </p>

                    <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-50">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] mr-2 text-indigo-700 font-bold">
                            {offer.user?.display_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {offer.user?.display_name || 'Neighbor'}
                    </div>
                </div>
            </div>
        </Link>
    );
}
