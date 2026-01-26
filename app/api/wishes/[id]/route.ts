import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: wish, error: fetchError } = await supabase
            .from('wishes')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !wish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
        }

        if (wish.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get update data
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

        // Build update object
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (categoryId) updateData.category_id = categoryId;
        updateData.updated_at = new Date().toISOString();

        // Update the wish
        const { data: updatedWish, error: updateError } = await supabase
            .from('wishes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ wish: updatedWish });
    } catch (error: any) {
        console.error('Update wish error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: wish, error: fetchError } = await supabase
            .from('wishes')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !wish) {
            return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
        }

        if (wish.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Delete the wish
        const { error: deleteError } = await supabase
            .from('wishes')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete wish error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
