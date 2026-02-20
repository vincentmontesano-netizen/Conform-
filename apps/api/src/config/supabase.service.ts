import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getClientForUser(accessToken: string): SupabaseClient {
    return createClient(
      process.env.SUPABASE_URL || 'http://localhost:54321',
      process.env.SUPABASE_ANON_KEY || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );
  }
}
