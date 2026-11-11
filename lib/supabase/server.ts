import { createServerClient } from '@/lib/neon/supabase-ssr-compat';

export async function createClient() {
    return createServerClient();
}
