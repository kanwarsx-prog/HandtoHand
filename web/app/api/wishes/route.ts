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
        const { title, description, categorySlug } = body;

        // Get category ID from slug
        let categoryId = null;
        if (categorySlug) {
            const { data: category } = await supabase
                .from('categories')
                .select('id')
                .eq('slug', categorySlug)
                .single();

            if (category) {
                categoryId = category.id;
            }
        }

        // Create Wish
        const { data: wish, error: createError } = await supabase
            .from('wishes')
            .insert({
                user_id: user.id,
                title,
                description,
                category_id: categoryId,
            })
            .select()
            .single();

        if (createError) {
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        return NextResponse.json({ wish });
    } catch (error: any) {
        console.error('Create wish error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

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

        let query = supabase
            .from('wishes')
            .select(`
                *,
                category:categories(name, slug, icon),
                user:users(display_name, profile_photo)
            `)
            .eq('status', 'ACTIVE')
            .order('created_at', { ascending: false });

        // Filter by user if specified
        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data: wishes, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ wishes });
    } catch (error: any) {
        console.error('Get wishes error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
