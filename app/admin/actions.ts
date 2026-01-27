'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


async function getSupabaseAdmin() {
    const cookieStore = await cookies();

    // We use the standard client to get the USER, to verify who they are.
    // BUT for the actual admin actions (deleting other people's stuff), we might need
    // Service Role key if RLS blocks us. 
    // However, for MVP, let's try to stick to standard client and see if we can use RLS policies
    // or if we need to use the service role.
    // Given the complexity of "Admin" RLS without custom claims, using Service Role for *actions* 
    // is often cleaner in these small MVPs, strictly gated by the email check.
    // 
    // actually, let's use the standard client for auth check, and then return a 
    // service-role client if authorized.
    // Prereq: process.env.SUPABASE_SERVICE_ROLE_KEY must be set. 
    // If not set, we might fail. Let's assume standard client + RLS updates if we added policies.
    //
    // WAIT: I didn't add "Admin" policies to the schema.
    // So standard client WONT work for deleting other users' content.
    // I MUST use Service Role or add policies.
    // Adding policies is safer but requires DB migration.
    // Using Service Role here is fast.

    // Let's use standard client to verify identity, then standard client to do operations 
    // IF I add the policies. But I don't want to run more SQL right now if I can avoid it?
    // User asked for "Admin page". 
    // Let's rely on the Service Role Key pattern for Admin actions to avoid complex SQL policies now.

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
        throw new Error('Unauthorized');
    }

    // Check is_admin flag from DB (Standard client respects RLS, but user can read own data)
    const { data: userData, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (error || !userData || !userData.is_admin) {
        throw new Error('Unauthorized');
    }

    return { supabase, user }; // Returning standard client for now. 
    // If operations fail, I will switch to service role client creation inside the action.
}

// Action: Dismiss Report
export async function dismissReport(reportId: string) {
    try {
        const { supabase } = await getSupabaseAdmin();

        // We need to bypass RLS to update reports table if policies don't allow it.
        // My schema said: users can insert. No policy for update mentioned for "Admins".
        // Use Service Key for the actual operation.
        const adminClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        );

        const { error } = await adminClient
            .from('reports')
            .update({ status: 'DISMISSED', reviewed_at: new Date().toISOString() })
            .eq('id', reportId);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Dismiss error:', error);
        return { error: error.message };
    }
}

// Action: Ban User
export async function banUser(userId: string) {
    try {
        const { supabase } = await getSupabaseAdmin();

        const adminClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        );

        // 1. Update user status
        const { error: userError } = await adminClient
            .from('users')
            .update({ status: 'BANNED' })
            .eq('id', userId);

        if (userError) throw userError;

        // 2. Remove their offers (Soft delete or set status)
        await adminClient
            .from('offers')
            .update({ status: 'REMOVED' })
            .eq('user_id', userId);

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

// Action: Delete Content (Offer)
export async function deleteOffer(offerId: string, reportId?: string) {
    try {
        const { supabase } = await getSupabaseAdmin();

        const adminClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        );

        const { error } = await adminClient
            .from('offers')
            .update({ status: 'REMOVED' })
            .eq('id', offerId);

        if (error) throw error;

        // If linked to a report, mark report as actioned
        if (reportId) {
            await adminClient
                .from('reports')
                .update({ status: 'ACTIONED', resolution: 'Offer Removed', reviewed_at: new Date().toISOString() })
                .eq('id', reportId);
        }

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

// Action: Unban User
export async function unbanUser(userId: string) {
    try {
        const { supabase } = await getSupabaseAdmin();

        const adminClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { cookies: { getAll: () => [], setAll: () => { } } }
        );

        // 1. Update user status
        const { error: userError } = await adminClient
            .from('users')
            .update({ status: 'ACTIVE' })
            .eq('id', userId);

        if (userError) throw userError;

        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
