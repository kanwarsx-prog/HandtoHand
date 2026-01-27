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
        const body = await request.json();
        const { action } = body; // 'AGREE', 'COMPLETE', 'CANCEL'

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

        // Fetch current exchange
        const { data: exchange, error: fetchError } = await supabase
            .from('exchanges')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !exchange) {
            return NextResponse.json({ error: 'Exchange not found' }, { status: 404 });
        }

        // Verify participant
        if (exchange.initiator_id !== user.id && exchange.responder_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updates: any = {};
        const isInitiator = exchange.initiator_id === user.id;

        if (action === 'CANCEL') {
            updates.status = 'CANCELLED';
        } else if (action === 'AGREE') {
            // Logic: 
            // If status is PROPOSED:
            // - If responder clicks agree -> move to AGREED
            // - If initiator clicks agree -> nothing (they already proposed)
            if (exchange.status === 'PROPOSED') {
                if (!isInitiator) {
                    updates.status = 'AGREED';
                    updates.agreed_at = new Date().toISOString();
                }
            }
        } else if (action === 'COMPLETE') {
            // Logic: Both must confirm
            if (isInitiator) updates.initiator_confirmed = true;
            else updates.responder_confirmed = true;

            // Check if becoming fully completed
            // We need to account for the current update + existing state
            const initiatorDone = isInitiator ? true : exchange.initiator_confirmed;
            const responderDone = !isInitiator ? true : exchange.responder_confirmed;

            if (initiatorDone && responderDone) {
                updates.status = 'COMPLETED';
                updates.completed_at = new Date().toISOString();
            }
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { data: updated, error: updateError } = await supabase
            .from('exchanges')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ exchange: updated });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
