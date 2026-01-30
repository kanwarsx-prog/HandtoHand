import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function InboxPage() {
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
                    <p className="text-gray-600 mb-6">You need to be logged in to view messages.</p>
                    <Link href="/auth/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch all conversations for the current user via participants table
    const { data: myParticipations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

    let conversations: any[] = [];

    if (myParticipations && myParticipations.length > 0) {
        const conversationIds = myParticipations.map(p => p.conversation_id);

        // Fetch conversation details
        const { data: convData } = await supabase
            .from('conversations')
            .select('*, offer:offers(title, id)')
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

        if (convData) {
            // For each conversation, get the other participant
            for (const conv of convData) {
                const { data: participants } = await supabase
                    .from('conversation_participants')
                    .select('user_id, users(display_name, id)')
                    .eq('conversation_id', conv.id)
                    .neq('user_id', user.id);

                if (participants && participants.length > 0) {
                    conversations.push({
                        ...conv,
                        otherUser: participants[0].users
                    });
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 items-center">
                        <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center">
                            ← Back to Home
                        </Link>
                        <h1 className="font-semibold text-gray-900">Messages</h1>
                        <div className="w-20"></div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {conversations && conversations.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {conversations.map((conv: any) => {
                                const otherUser = conv.otherUser;

                                return (
                                    <Link
                                        key={conv.id}
                                        href={`/messages/${conv.id}`}
                                        className="block p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            {otherUser?.id ? (
                                                <Link
                                                    href={`/profile/${otherUser.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0 hover:bg-indigo-200 transition-colors"
                                                >
                                                    {otherUser?.display_name?.[0]?.toUpperCase() || 'U'}
                                                </Link>
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                                                    {otherUser?.display_name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {otherUser?.display_name || 'User'}
                                                    </h3>
                                                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                        {new Date(conv.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {conv.offer && (
                                                    <p className="text-sm text-gray-500 truncate">
                                                        Re: {conv.offer.title}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4">
                            <div className="text-4xl mb-4">💬</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-gray-500 mb-6">
                                Start a conversation by messaging someone about their offer!
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Browse Offers
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
