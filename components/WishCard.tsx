import Link from 'next/link';

interface Wish {
    id: string;
    title: string;
    description: string;
    category: {
        icon: string;
        name: string;
        slug: string;
    } | null;
    user?: {
        display_name: string;
    } | null;
    created_at: string;
    status: string;
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

export default function WishCard({ wish }: { wish: any }) {
    const getIcon = (slug: string) => CATEGORY_ICONS[slug] || '✨';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all h-full flex flex-col relative group">
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold shadow-sm ${wish.status === 'ACTIVE' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {wish.status}
                </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-xl">
                    {wish.category?.icon || getIcon(wish.category?.slug)}
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Looking For</p>
                    <p className="text-sm font-bold text-purple-700">{wish.category?.name || 'Item'}</p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                {wish.title}
            </h3>

            <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                {wish.description}
            </p>

            <div className="pt-4 border-t border-gray-50 mt-auto flex justify-between items-center text-xs text-gray-400">
                <span>Posted {new Date(wish.created_at).toLocaleDateString()}</span>
                {/* Could add 'Edit' link here if it owns to user */}
            </div>
        </div>
    );
}
