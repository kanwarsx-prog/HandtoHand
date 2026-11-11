import { createClient as createDataApiClient, type SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth/server";

const dataApiUrl = process.env.NEON_DATA_API_URL!;

function createClient(): SupabaseClient {
  return createDataApiClient(dataApiUrl, "neon-data-api", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => {
      try {
        const result = await (auth.token as unknown as () => Promise<{ data?: { token?: string } }>)();
        return result.data?.token ?? null;
      } catch {
        return null;
      }
    },
  });
}

export function createServerClient(_url?: string, _key?: string, _options?: unknown): SupabaseClient {
  const client = createClient();

  Object.defineProperty(client, "auth", {
    configurable: true,
    value: {
      getUser: async () => {
        const { data: session, error } = await auth.getSession();
        return { data: { user: session?.user ?? null }, error };
      },
      getSession: async () => {
        const { data: session, error } = await auth.getSession();
        return { data: { session }, error };
      },
    },
  });

  return client;
}
