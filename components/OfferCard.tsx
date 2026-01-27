import Link from 'next/link';
import { Tag, User } from 'lucide-react';

interface Offer {
    id: string;
    title: string;
    description: string;
    category: {
        icon: string;
        name: string;
        slug: string;
    } | null;
    user: {
        display_name: string;
    } | null;
    created_at: string;
    image_url: string | null;
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

export default function OfferCard({ offer }: { offer: Offer }) {
    // Helper to safely get icon
    const getIcon = (slug: string) => CATEGORY_ICONS[slug] || '📦';

    const hasImage = !!offer.image_url;

    if (!hasImage) {
        return (
            <Link
                href={`/offers/${offer.id}`}
                className="block h-full"
            >
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col p-6 relative overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:border-teal-200">
                    {/* Permanent soft gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-teal-50/50" />

                    <div className="flex items-start justify-between mb-4 relative z-10">
                        {/* Icon - Always colorful */}
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shadow-sm border border-teal-100">
                            {offer.category?.icon || getIcon(offer.category?.slug || 'misc')}
                        </div>
                        <span className="
                            inline-flex items-center px-3 py-1 
                            rounded-full text-xs font-bold 
                            bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-100 shadow-sm
                        ">
                            {offer.category?.name || 'Item'}
                        </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-slate-800 mb-2 line-clamp-2 leading-tight relative z-10">
                        {offer.title}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-3 mb-4 relative z-10 font-medium">
                        {offer.description}
                    </p>

                    <div className="flex items-center text-xs text-slate-400 pt-4 border-t border-slate-100 mt-auto relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-600 font-bold">
                                {offer.user?.display_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <span className="truncate max-w-[100px] font-semibold text-slate-500">{offer.user?.display_name || 'Neighbor'}</span>
                        </div>
                        <span className="mx-2 text-slate-300">•</span>
                        <span>{new Date(offer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/offers/${offer.id}`}
            className="block group h-full"
        >
            <div className={`
                bg-white rounded-3xl overflow-hidden h-full flex flex-col
                transition-all duration-300 ease-out
                border border-transparent hover:border-teal-100
                shadow-sm hover:shadow-xl hover:-translate-y-1
            `}>
                {/* Image or Placeholder - Only Image here now */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                        src={offer.image_url!}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Category Badge - Glassmorphic */}
                    <div className="absolute top-3 left-3">
                        <span className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 
                            rounded-full text-xs font-bold 
                            bg-white/90 backdrop-blur-md shadow-sm text-slate-700
                        ">
                            {offer.category?.name || 'Item'}
                        </span>
                    </div>

                    {/* Date Badge */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[10px] font-medium">
                            {new Date(offer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-display font-bold text-lg text-slate-800 mb-2 leading-tight group-hover:text-teal-600 transition-colors line-clamp-2">
                        {offer.title}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                        {offer.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                                {offer.user?.display_name?.[0]?.toUpperCase() || <User size={12} />}
                            </div>
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                                {offer.user?.display_name || 'Neighbor'}
                            </span>
                        </div>
                        <span className="text-teal-600 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                            View <span className="text-sm">→</span>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
