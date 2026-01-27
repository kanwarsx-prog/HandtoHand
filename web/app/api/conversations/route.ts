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
        const { user2_id, offer_id } = body;

        if (!user2_id) {
            return NextResponse.json({ error: 'Missing user2_id' }, { status: 400 });
        }

        // Verify user2_id exists in users table
        const { data: user2, error: user2Error } = await supabase
            .from('users')
            .select('id')
            .eq('id', user2_id)
            .single();

        if (user2Error || !user2) {
            console.error('User2 not found:', user2_id, user2Error);
            return NextResponse.json({
                error: 'Recipient user not found. They may need to complete their profile setup.'
            }, { status: 404 });
        }

        // Check if conversation already exists between these two users for this offer
        // First, get all conversations the current user is part of
        const { data: myParticipations, error: fetchError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

        if (fetchError) {
            console.error('Fetch error:', fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (myParticipations && myParticipations.length > 0) {
            const conversationIds = myParticipations.map(p => p.conversation_id);

            // Now check if any of these conversations also has the other user
            const { data: otherUserParticipations } = await supabase
                .from('conversation_participants')
                .select('conversation_id')
                .eq('user_id', user2_id)
                .in('conversation_id', conversationIds);

            if (otherUserParticipations && otherUserParticipations.length > 0) {
                // Found conversations with both users, now filter by offer_id if provided
                const sharedConvIds = otherUserParticipations.map(p => p.conversation_id);

                let query = supabase
                    .from('conversations')
                    .select('*')
                    .in('id', sharedConvIds);

                if (offer_id) {
                    query = query.eq('offer_id', offer_id);
                } else {
                    query = query.is('offer_id', null);
                }

                const { data: existingConversations } = await query;

                if (existingConversations && existingConversations.length > 0) {
                    return NextResponse.json({ conversation: existingConversations[0] });
                }
            }
        }

        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                offer_id: offer_id || null
            })
            .select()
            .single();

        if (createError) {
            console.error('Create error:', createError);
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        // Verify current user exists in users table before adding as participant
        const { data: currentUserProfile, error: currentUserError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (currentUserError || !currentUserProfile) {
            console.error('Current user not in users table:', user.id);
            // Clean up the conversation we just created
            await supabase.from('conversations').delete().eq('id', newConversation.id);
            return NextResponse.json({
                error: 'Your profile is incomplete. Please visit /profile/edit to complete your profile setup.'
            }, { status: 400 });
        }

        // Add both participants
        const { error: participantsError } = await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: newConversation.id, user_id: user.id },
                { conversation_id: newConversation.id, user_id: user2_id }
            ]);

        if (participantsError) {
            console.error('Participants error:', participantsError);
            // Try to clean up the conversation
            await supabase.from('conversations').delete().eq('id', newConversation.id);
            return NextResponse.json({ error: participantsError.message }, { status: 500 });
        }

        return NextResponse.json({ conversation: newConversation });

    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
