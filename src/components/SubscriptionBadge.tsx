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
      <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
        <Crown className="w-3 h-3 mr-1" />
        Pro
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
      <Zap className="w-3 h-3 mr-1" />
      Free
    </Badge>
  );
};