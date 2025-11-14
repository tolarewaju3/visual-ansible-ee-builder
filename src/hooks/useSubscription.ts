import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscriptionService, SubscriptionPlan, UserSubscription } from '@/lib/subscriptionService';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>('free');
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!user) {
        setSubscriptionPlan('free');
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const [profile, userSubscription] = await Promise.all([
          subscriptionService.getUserProfile(),
          subscriptionService.getUserSubscription()
        ]);

        if (profile) {
          setSubscriptionPlan(profile.subscription_plan as SubscriptionPlan);
        }
        
        setSubscription(userSubscription);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptionData();
  }, [user]);

  const isPro = subscriptionPlan === 'pro';
  const isFree = subscriptionPlan === 'free';

  return {
    subscriptionPlan,
    subscription,
    isPro,
    isFree,
    loading,
    refresh: () => {
      setLoading(true);
      // Trigger useEffect by changing the dependency
    }
  };
};