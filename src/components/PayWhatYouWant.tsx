import { useState } from 'react';
import { Coffee, Donut, Zap, Heart, Pizza } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscriptionService } from '@/lib/subscriptionService';
import { useToast } from '@/hooks/use-toast';
export const PayWhatYouWant = () => {
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const predefinedAmounts = [{
    amount: 3,
    label: 'Coffee',
    icon: Coffee
  }, {
    amount: 5,
    label: 'Donut',
    icon: Donut
  }, {
    amount: 10,
    label: 'Pizza',
    icon: Pizza
  }];
  const handlePayment = async (amount: number) => {
    setLoading(true);
    try {
      // Create a one-time payment checkout session
      const checkoutUrl = await subscriptionService.createAnonymousCheckoutSession(amount);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start payment process. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return;
};