// Matching algorithm for HandtoHand
// Scores potential matches based on category, keywords, and proximity

interface Offer {
    id: string;
    title: string;
    description: string;
    category_id: string;
    user_id: string;
    user?: {
        display_name: string;
        postcode_outward: string;
    };
}

interface Wish {
    id: string;
    title: string;
    description: string;
    category_id: string;
    user_id: string;
    user?: {
        display_name: string;
        postcode_outward: string;
    };
}

interface Match {
    score: number;
    offer?: Offer;
    wish?: Wish;
    matchType: 'offer_for_wish' | 'wish_for_offer' | 'reciprocal';
    reasons: string[];
}

// Calculate keyword similarity using simple word overlap
function calculateKeywordSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);

    const commonWords = words1.filter(w => words2.includes(w));
    const totalWords = new Set([...words1, ...words2]).size;

    return totalWords > 0 ? commonWords.length / totalWords : 0;
}

// Calculate match score between an offer and a wish
export function calculateMatchScore(
    offer: Offer,
    wish: Wish,
    currentUserPostcode?: string
): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Category match (40% weight)
    if (offer.category_id === wish.category_id) {
        score += 40;
        reasons.push('Same category');
    }

    // Keyword similarity in title (20% weight)
    const titleSimilarity = calculateKeywordSimilarity(offer.title, wish.title);
    const titleScore = titleSimilarity * 20;
    score += titleScore;
    if (titleScore > 5) {
        reasons.push('Similar keywords in title');
    }

    // Keyword similarity in description (10% weight)
    const descSimilarity = calculateKeywordSimilarity(offer.description, wish.description);
    const descScore = descSimilarity * 10;
    score += descScore;
    if (descScore > 3) {
        reasons.push('Similar description');
    }

    // Geographic proximity (20% weight)
    if (currentUserPostcode && offer.user?.postcode_outward) {
        if (offer.user.postcode_outward === currentUserPostcode) {
            score += 20;
            reasons.push('Same area');
        } else if (offer.user.postcode_outward.substring(0, 2) === currentUserPostcode.substring(0, 2)) {
            score += 10;
            reasons.push('Nearby area');
        }
    }

    // Recency bonus (10% weight) - could be added based on created_at

    return { score, reasons };
}

// Find offers that match a user's wishes
export function findOffersForWishes(
    wishes: Wish[],
    allOffers: Offer[],
    currentUserPostcode?: string,
    minScore: number = 30
): Match[] {
    const matches: Match[] = [];

    wishes.forEach(wish => {
        allOffers.forEach(offer => {
            // Don't match user's own offers
            if (offer.user_id === wish.user_id) return;

            const { score, reasons } = calculateMatchScore(offer, wish, currentUserPostcode);

            if (score >= minScore) {
                matches.push({
                    score,
                    offer,
                    wish,
                    matchType: 'offer_for_wish',
                    reasons
                });
            }
        });
    });

    return matches.sort((a, b) => b.score - a.score);
}

// Find wishes that match a user's offers
export function findWishesForOffers(
    offers: Offer[],
    allWishes: Wish[],
    currentUserPostcode?: string,
    minScore: number = 30
): Match[] {
    const matches: Match[] = [];

    offers.forEach(offer => {
        allWishes.forEach(wish => {
            // Don't match user's own wishes
            if (wish.user_id === offer.user_id) return;

            const { score, reasons } = calculateMatchScore(offer, wish, currentUserPostcode);

            if (score >= minScore) {
                matches.push({
                    score,
                    offer,
                    wish,
                    matchType: 'wish_for_offer',
                    reasons
                });
            }
        });
    });

    return matches.sort((a, b) => b.score - a.score);
}

// Find reciprocal matches (user A wants user B's offer, user B wants user A's offer)
export function findReciprocalMatches(
    userOffers: Offer[],
    userWishes: Wish[],
    allOffers: Offer[],
    allWishes: Wish[],
    currentUserPostcode?: string,
    minScore: number = 25
): Match[] {
    const reciprocalMatches: Match[] = [];

    // Find offers that match my wishes
    const offersForMyWishes = findOffersForWishes(userWishes, allOffers, currentUserPostcode, minScore);

    // For each match, check if they want something I offer
    offersForMyWishes.forEach(match => {
        if (!match.offer) return;

        const theirUserId = match.offer.user_id;
        const theirWishes = allWishes.filter(w => w.user_id === theirUserId);

        theirWishes.forEach(theirWish => {
            userOffers.forEach(myOffer => {
                const { score, reasons } = calculateMatchScore(myOffer, theirWish, currentUserPostcode);

                if (score >= minScore) {
                    reciprocalMatches.push({
                        score: (match.score + score) / 2, // Average both match scores
                        offer: match.offer,
                        wish: match.wish,
                        matchType: 'reciprocal',
                        reasons: [...match.reasons, ...reasons, 'Mutual interest!']
                    });
                }
            });
        });
    });

    return reciprocalMatches.sort((a, b) => b.score - a.score);
}
