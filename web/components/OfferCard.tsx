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

    const hasImage = !!offer.image_url;

    // Compact card variant for no-image offers
    if (!hasImage) {
        return (
            <Link
                href={`/offers/${offer.id}`}
                className="block group"
            >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 flex flex-col p-5 relative overflow-hidden">
                    {/* Decorative background accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500" />

                    <div className="flex items-start justify-between mb-3 relative z-10">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            {offer.category?.icon || getIcon(offer.category?.slug)}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                            {offer.category?.name || 'Item'}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                        {offer.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                        {offer.description}
                    </p>

                    <div className="flex items-center text-xs text-gray-400 pt-3 border-t border-gray-50 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                {offer.user?.display_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="truncate max-w-[100px]">{offer.user?.display_name || 'Neighbor'}</span>
                        </div>
                        <span className="mx-2 text-gray-300">•</span>
                        <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/offers/${offer.id}`}
            className="block group"
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 h-full flex flex-col">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                    <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                        {offer.category?.name || 'Item'}
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {offer.title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {offer.description}
                    </p>

                    <div className="flex items-center text-xs text-gray-500 pt-3 border-t border-gray-50">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] mr-2 font-bold">
                            {offer.user?.display_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        {offer.user?.display_name || 'Neighbor'}
                    </div>
                </div>
            </div>
        </Link>
    );
}
