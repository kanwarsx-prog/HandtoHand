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
                    set(name: string, value: string, options: any) {
                        try {
                            cookieStore.set({ name, value, ...options });
                        } catch (error) {
                            // Ignore cookie errors in API routes
                        }
                    },
                    remove(name: string, options: any) {
                        try {
                            cookieStore.set({ name, value: '', ...options });
                        } catch (error) {
                            // Ignore cookie errors in API routes
                        }
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
        const { displayName, postcode, bio, categories } = body;

        // Validate required fields
        if (!displayName || !postcode || !bio) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Extract postcode outward (first part)
        const postcodeOutward = postcode.split(' ')[0];

        // Create or update user profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                email: user.email!,
                display_name: displayName,
                postcode_outward: postcodeOutward,
                postcode_full: postcode,
                bio: bio,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (profileError) {
            console.error('Profile error:', profileError);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        // TODO: Save categories (we'll need to create category records first)
        // For now, we'll skip this and add it later

        return NextResponse.json({ success: true, profile });
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
