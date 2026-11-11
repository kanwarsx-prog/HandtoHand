import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    // Neon Auth handles verification and session callbacks through /api/auth/*.
    return NextResponse.redirect(new URL('/', requestUrl.origin));
}
