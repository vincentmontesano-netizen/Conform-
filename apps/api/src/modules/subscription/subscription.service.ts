import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class SubscriptionService {
    constructor(private readonly supabaseService: SupabaseService) { }

    async findByCompany(companyId: string) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('subscriptions')
            .select('*')
            .eq('company_id', companyId)
            .single();

        if (error) throw error;
        return data;
    }

    async updatePlan(companyId: string, plan: string, status: string) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('subscriptions')
            .update({ plan, status, updated_at: new Date().toISOString() })
            .eq('company_id', companyId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getAllWithCompanies() {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('subscriptions')
            .select('*, companies(id, name, created_at)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getMetrics() {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('subscriptions')
            .select('plan, status');

        if (error) throw error;

        const total = data?.length ?? 0;
        const byPlan = { basic: 0, pro: 0, premium: 0, enterprise: 0 };
        for (const sub of data ?? []) {
            if (sub.plan in byPlan) byPlan[sub.plan as keyof typeof byPlan]++;
        }

        // MRR estimé (€)
        const pricing = { basic: 0, pro: 49, premium: 99, enterprise: 299 };
        const mrr = (data ?? [])
            .filter((s) => s.status === 'active')
            .reduce((acc, s) => acc + (pricing[s.plan as keyof typeof pricing] ?? 0), 0);

        return { total, byPlan, mrr };
    }
}
