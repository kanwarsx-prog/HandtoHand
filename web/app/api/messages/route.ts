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
        const { conversation_id, content } = body;

        if (!conversation_id || !content) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Verify user is participant
        const { data: participation, error: participationError } = await supabase
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', conversation_id)
            .eq('user_id', user.id)
            .single();

        if (participationError || !participation) {
            console.error('User not a participant:', participationError);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Send Message
        const { data: message, error: sendError } = await supabase
            .from('messages')
            .insert({
                conversation_id,
                sender_id: user.id,
                content
            })
            .select()
            .single();

        if (sendError) {
            return NextResponse.json({ error: sendError.message }, { status: 500 });
        }

        // Update conversation timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversation_id);

        return NextResponse.json({ message });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Implementation for Real-time fetching usually is done via Supabase Client subscription
    // But this can be used for initial load
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

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

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ messages });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
