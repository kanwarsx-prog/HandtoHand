import { createClient as createDataApiClient } from '@supabase/supabase-js';
import { authClient } from '@/lib/auth/client';

export function createClient() {
    return createDataApiClient(process.env.NEXT_PUBLIC_NEON_DATA_API_URL!, 'neon-data-api', {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        accessToken: async () => {
            try {
                const { data } = await authClient.token();
                return data?.token ?? null;
            } catch {
                return null;
            }
        },
    });
}
