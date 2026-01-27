import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const body = await request.json();
        const { partner_id, offer_id, wish_id, offer_title, wish_title } = body;

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

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check for existing active exchange
        const { data: existing } = await supabase
            .from('exchanges')
            .select('*')
            .or(`and(initiator_id.eq.${user.id},responder_id.eq.${partner_id}),and(initiator_id.eq.${partner_id},responder_id.eq.${user.id})`)
            .in('status', ['PROPOSED', 'AGREED'])
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Active exchange already exists' }, { status: 400 });
        }

        // Create new exchange
        const { data, error } = await supabase
            .from('exchanges')
            .insert({
                initiator_id: user.id,
                responder_id: partner_id,
                initiator_offer_id: offer_id, // If I'm offering something
                responder_offer_id: wish_id, // If I want something of theirs (which implies they offer it? Wait, logic might be mixed. Let's keep it generic for now)
                // For simplicity in MVP: "initiator_offer" is what *I* bring, "responder_offer" is what *YOU* bring.
                // But often context is "I want your item".
                // Let's rely on the passed titles for the snapshot.
                initiator_offer: offer_title,
                responder_offer: wish_title,
                status: 'PROPOSED'
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // --- Notification Trigger ---
        await supabase.from('notifications').insert({
            user_id: partner_id,
            type: 'EXCHANGE_PROPOSAL',
            title: 'New Exchange Proposal',
            message: `${user.user_metadata.display_name || 'A neighbor'} proposed an exchange: ${offer_title || 'Item'} for ${wish_title || 'Item'}`,
            link: '/messages' // Ideally link to specific chat but we don't have convo ID handy here easy. 
            // Better: Find convo ID or just link to /messages general
        });
        // ---------------------------

        return NextResponse.json({ exchange: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const { searchParams } = new URL(request.url);
        const partner_id = searchParams.get('partner_id');

        if (!partner_id) {
            return NextResponse.json({ error: 'Partner ID required' }, { status: 400 });
        }

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

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get active exchange between these users
        const { data, error } = await supabase
            .from('exchanges')
            .select('*')
            .or(`and(initiator_id.eq.${user.id},responder_id.eq.${partner_id}),and(initiator_id.eq.${partner_id},responder_id.eq.${user.id})`)
            .in('status', ['PROPOSED', 'AGREED'])
            .order('created_at', { ascending: false }) // Get latest if multiple (though we check for exists)
            .limit(1)
            .single();

        // It's okay if no data found, just return null
        if (error && error.code !== 'PGRST116') {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ exchange: data || null });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
