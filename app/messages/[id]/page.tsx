import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ChatWindow from '@/components/ChatWindow';

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div>Please sign in</div>;
    }

    // Fetch conversation details
    const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*, offer:offers(title, id)')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Conversation fetch error:', error);
    }

    if (error || !conversation) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation not found</h1>
                <p className="text-gray-600 mb-4">Error: {error?.message || 'Unknown error'}</p>
                <Link href="/messages" className="text-indigo-600 hover:underline">← Back to Inbox</Link>
            </div>
        </div>;
    }

    // Verify user is a participant
    const { data: participation } = await supabase
        .from('conversation_participants')
        .select('*')
        .eq('conversation_id', id)
        .eq('user_id', user.id)
        .single();

    if (!participation) {
        return <div>Access denied</div>;
    }

    // Get other participant
    const { data: otherParticipants } = await supabase
        .from('conversation_participants')
        .select('user_id, users(display_name, id)')
        .eq('conversation_id', id)
        .neq('user_id', user.id);

    const otherUser = otherParticipants?.[0]?.users as { display_name: string; id: string } | undefined;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navigation Helper */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link href="/messages" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                            ← Back to Inbox
                        </Link>
                        <div className="flex flex-col items-center">
                            <h1 className="font-semibold text-gray-900">{otherUser?.display_name || 'Chat'}</h1>
                            {conversation.offer && (
                                <span className="text-xs text-gray-500 max-w-[200px] truncate">
                                    Re: {conversation.offer.title}
                                </span>
                            )}
                        </div>
                        <div className="w-20"></div> {/* Spacer */}
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ChatWindow conversationId={id} currentUser={user} />
            </main>
        </div>
    );
}
