import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class AdminService {
    constructor(private readonly supabaseService: SupabaseService) { }

    async getGlobalMetrics() {
        const client = this.supabaseService.getClient();

        const [subsRes, companiesRes, usersRes] = await Promise.all([
            client.from('subscriptions').select('plan, status'),
            client.from('companies').select('id', { count: 'exact', head: true }),
            client.from('profiles').select('id', { count: 'exact', head: true }),
        ]);

        const subs = subsRes.data ?? [];
        const byPlan = { basic: 0, pro: 0, premium: 0, enterprise: 0 };
        const pricing: Record<string, number> = { basic: 0, pro: 49, premium: 99, enterprise: 299 };
        let mrr = 0;

        for (const s of subs) {
            if (s.plan in byPlan) byPlan[s.plan as keyof typeof byPlan]++;
            if (s.status === 'active') mrr += pricing[s.plan] ?? 0;
        }

        return {
            total_companies: companiesRes.count ?? 0,
            total_users: usersRes.count ?? 0,
            total_subscriptions: subs.length,
            byPlan,
            mrr,
        };
    }

    async getAllCompaniesWithSubscriptions() {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('companies')
            .select('*, subscriptions(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getAllUsersWithCompany() {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('profiles')
            .select('*, companies(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getAuditLogs(companyId?: string, action?: string) {
        const client = this.supabaseService.getClient();
        let query = client
            .from('audit_logs')
            .select('*, profiles(first_name, last_name), companies(name)')
            .order('created_at', { ascending: false })
            .limit(500);

        if (companyId) query = query.eq('company_id', companyId);
        if (action) query = query.eq('action', action);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    }

    async updateUserRole(profileId: string, role: string) {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('profiles')
            .update({ role })
            .eq('id', profileId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateSubscription(companyId: string, plan: string, status: string) {
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

    async getSettings() {
        const client = this.supabaseService.getClient();
        const { data, error } = await client
            .from('app_settings')
            .select('*')
            .order('key', { ascending: true });

        if (error) throw error;
        return data;
    }

    async updateSetting(key: string, value: any, description?: string) {
        const client = this.supabaseService.getClient();

        const updatePayload: any = { value, updated_at: new Date().toISOString() };
        if (description !== undefined) {
            updatePayload.description = description;
        }

        const { data, error } = await client
            .from('app_settings')
            .update(updatePayload)
            .eq('key', key)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
