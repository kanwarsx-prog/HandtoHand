import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
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

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, categorySlug, imageUrl } = body;

        // Validate required fields
        if (!title || !description || !categorySlug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Lookup Category ID by Slug
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

        if (catError || !category) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        // Create the offer
        const { data: offer, error: offerError } = await supabase
            .from('offers')
            .insert({
                user_id: user.id,
                title,
                description,
                category_id: category.id,
                image_url: imageUrl || null,
                status: 'ACTIVE',
                location_radius: 5,
                location_lat: 0,
                location_lng: 0,
            })
            .select()
            .single();

        if (offerError) {
            console.error('Offer error:', offerError);
            return NextResponse.json({ error: offerError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, offer });
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
