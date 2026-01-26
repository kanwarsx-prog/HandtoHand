import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { findOffersForWishes, findWishesForOffers, findReciprocalMatches } from '@/lib/matching';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const { searchParams } = new URL(request.url);
        const matchType = searchParams.get('type') || 'all';

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

        // Get user's profile for postcode
        const { data: userProfile } = await supabase
            .from('users')
            .select('postcode_outward')
            .eq('id', user.id)
            .single();

        // Fetch user's offers
        const { data: userOffers } = await supabase
            .from('offers')
            .select('*, user:users(display_name, postcode_outward)')
            .eq('user_id', user.id)
            .eq('status', 'ACTIVE');

        // Fetch user's wishes
        const { data: userWishes } = await supabase
            .from('wishes')
            .select('*, user:users(display_name, postcode_outward)')
            .eq('user_id', user.id)
            .eq('status', 'ACTIVE');

        // Fetch all other offers
        const { data: allOffers } = await supabase
            .from('offers')
            .select('*, user:users(display_name, postcode_outward)')
            .neq('user_id', user.id)
            .eq('status', 'ACTIVE');

        // Fetch all other wishes
        const { data: allWishes } = await supabase
            .from('wishes')
            .select('*, user:users(display_name, postcode_outward)')
            .neq('user_id', user.id)
            .eq('status', 'ACTIVE');

        const currentUserPostcode = userProfile?.postcode_outward;

        let matches: any = {};

        if (matchType === 'all' || matchType === 'offers_for_wishes') {
            matches.offersForWishes = findOffersForWishes(
                userWishes || [],
                allOffers || [],
                currentUserPostcode
            ).slice(0, 10); // Top 10 matches
        }

        if (matchType === 'all' || matchType === 'wishes_for_offers') {
            matches.wishesForOffers = findWishesForOffers(
                userOffers || [],
                allWishes || [],
                currentUserPostcode
            ).slice(0, 10);
        }

        if (matchType === 'all' || matchType === 'reciprocal') {
            matches.reciprocalMatches = findReciprocalMatches(
                userOffers || [],
                userWishes || [],
                allOffers || [],
                allWishes || [],
                currentUserPostcode
            ).slice(0, 5);
        }

        return NextResponse.json({ matches });
    } catch (error: any) {
        console.error('Matches error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
