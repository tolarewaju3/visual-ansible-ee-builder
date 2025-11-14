import { supabase } from '@/integrations/supabase/client';

export interface DailyExport {
  id: string;
  user_id: string;
  export_date: string;
  export_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  plan_name: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlan = 'free' | 'pro';

export interface CloudBuildUsage {
  used: number;
  remaining: number;
  total: number;
}

export const subscriptionService = {
  async getUserProfile() {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_plan, stripe_customer_id')
      .eq('user_id', session.session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  async getUserSubscription(): Promise<UserSubscription | null> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', session.session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return data;
  },

  async getTodayExportCount(): Promise<number> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return 0;
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_exports')
      .select('export_count')
      .eq('user_id', session.session.user.id)
      .eq('export_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching export count:', error);
      return 0;
    }

    return data?.export_count || 0;
  },

  async canUserExport(): Promise<boolean> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return false;
    }

    // Everyone can export now (unlimited)
    return true;
  },

  async incrementExportCount(): Promise<number> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      // Return 0 for unauthenticated users (no tracking)
      return 0;
    }

    const { data, error } = await supabase.rpc('increment_export_count', {
      user_uuid: session.session.user.id
    });

    if (error) {
      console.error('Error incrementing export count:', error);
      throw error;
    }

    return data;
  },

  async getCloudBuildUsage(): Promise<CloudBuildUsage> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { used: 0, remaining: 5, total: 5 };
    }

    // Use any type to bypass TypeScript restrictions on the table name
    const { data, error } = await (supabase as any)
      .from('user_cloud_builds')
      .select('builds_used, builds_purchased')
      .eq('user_id', session.session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching cloud build usage:', error);
      // New user - return default 5 free builds
      return { used: 0, remaining: 5, total: 5 };
    }

    const used = data?.builds_used || 0;
    const purchased = data?.builds_purchased || 0;
    const total = 5 + purchased; // 5 free + purchased packs (10 each)
    const remaining = Math.max(0, total - used);

    return { used, remaining, total };
  },

  async incrementCloudBuildCount(): Promise<CloudBuildUsage> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await (supabase as any).rpc('increment_cloud_build_count', {
      user_uuid: session.session.user.id
    });

    if (error) {
      console.error('Error incrementing cloud build count:', error);
      throw error;
    }

    return await this.getCloudBuildUsage();
  },

  async createCloudBuildCheckout(): Promise<string> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {}
    });

    if (error) {
      console.error('Error creating cloud build checkout session:', error);
      throw error;
    }

    return data.url;
  },
};