import { supabase } from '@/integrations/supabase/client';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  plan_name: string;
  created_at: string;
  updated_at: string;
}

export interface DailyExport {
  id: string;
  user_id: string;
  export_date: string;
  export_count: number;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlan = 'free' | 'pro';

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
      .eq('status', 'active')
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

  async createCheckoutSession(planType: 'pro'): Promise<string> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        planType,
        userId: session.session.user.id,
        userEmail: session.session.user.email,
      }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }

    return data.url;
  },

  async createPortalSession(): Promise<string> {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: {
        userId: session.session.user.id,
      }
    });

    if (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }

    return data.url;
  },
};