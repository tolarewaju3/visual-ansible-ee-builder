import { Crown, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionBadge = () => {
  const { subscriptionPlan, loading } = useSubscription();

  if (loading) {
    return null;
  }

  if (subscriptionPlan === 'pro') {
    return (
      <Badge variant="default" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0">
        <Crown className="w-3 h-3 mr-1" />
        Supporter
      </Badge>
    );
  }

  return null; // Don't show anything for free users
};