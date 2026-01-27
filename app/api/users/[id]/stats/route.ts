import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
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

        // Get completed count
        const { count: completedCount, error: countError } = await supabase
            .from('exchanges')
            .select('*', { count: 'exact', head: true })
            .or(`initiator_id.eq.${id},responder_id.eq.${id}`)
            .eq('status', 'COMPLETED');

        if (countError) {
            return NextResponse.json({ error: countError.message }, { status: 500 });
        }

        // Get recommendation stats
        const { data: feedback, error: feedbackError } = await supabase
            .from('feedback')
            .select('would_exchange_again')
            .eq('to_user_id', id);

        if (feedbackError) {
            return NextResponse.json({ error: feedbackError.message }, { status: 500 });
        }

        const totalFeedback = feedback.length;
        const positiveFeedback = feedback.filter(f => f.would_exchange_again).length;
        const recommendationPercentage = totalFeedback > 0
            ? Math.round((positiveFeedback / totalFeedback) * 100)
            : 0;

        return NextResponse.json({
            stats: {
                completed_count: completedCount || 0,
                recommended_count: positiveFeedback,
                total_feedback: totalFeedback,
                recommendation_percentage: recommendationPercentage
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
