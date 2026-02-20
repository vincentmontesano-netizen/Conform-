import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

export function createClient(
  url: string,
  key: string,
  options?: { accessToken?: string },
): SupabaseClient {
  const config: Record<string, unknown> = {};

  if (options?.accessToken) {
    config.global = {
      headers: {
        Authorization: `Bearer ${options.accessToken}`,
      },
    };
  }

  return createSupabaseClient(url, key, config);
}
