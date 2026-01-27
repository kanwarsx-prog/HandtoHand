import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const body = await request.json();
        const { exchange_id, would_exchange_again, comment } = body;

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

        // Verify exchange exists and is completed
        const { data: exchange, error: fetchError } = await supabase
            .from('exchanges')
            .select('*')
            .eq('id', exchange_id)
            .single();

        if (fetchError || !exchange) {
            return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
        }

        if (exchange.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Exchange must be completed to leave feedback' }, { status: 400 });
        }

        // Verify participant
        if (exchange.initiator_id !== user.id && exchange.responder_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Determine target user
        const to_user_id = exchange.initiator_id === user.id ? exchange.responder_id : exchange.initiator_id;

        // Insert feedback
        const { data, error } = await supabase
            .from('feedback')
            .insert({
                exchange_id,
                from_user_id: user.id,
                to_user_id,
                would_exchange_again,
                comment
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'Feedback already submitted' }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ feedback: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
