import { createClient } from '@/lib/supabase/client';

const CATEGORIES = [
    { name: 'Food & Cooking', slug: 'food', icon: '🍳', order: 1 },
    { name: 'Gardening', slug: 'gardening', icon: '🌱', order: 2 },
    { name: 'DIY & Tools', slug: 'diy', icon: '🔨', order: 3 },
    { name: 'Skills & Teaching', slug: 'skills', icon: '📚', order: 4 },
    { name: 'Transport', slug: 'transport', icon: '🚗', order: 5 },
    { name: 'Childcare', slug: 'childcare', icon: '👶', order: 6 },
    { name: 'Tech & Repair', slug: 'tech', icon: '💻', order: 7 },
    { name: 'Arts & Crafts', slug: 'arts', icon: '🎨', order: 8 },
];

export async function seedCategories() {
    const supabase = createClient();

    for (const cat of CATEGORIES) {
        const { error } = await supabase
            .from('categories')
            .upsert(cat, { onConflict: 'slug' });

        if (error) console.error('Error seeding category:', cat.name, error);
        else console.log('Seeded:', cat.name);
    }
}
