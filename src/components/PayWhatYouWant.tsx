import { useState } from 'react';
import { Coffee, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscriptionService } from '@/lib/subscriptionService';
import { useToast } from '@/hooks/use-toast';

export const PayWhatYouWant = () => {
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [
    { amount: 5, label: 'Coffee', icon: Coffee },
    { amount: 25, label: 'Support', icon: Zap },
  ];

  const handlePayment = async (amount: number) => {
    setLoading(true);
    try {
      // Create a one-time payment checkout session
      const checkoutUrl = await subscriptionService.createCheckoutSession('pro');
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating payment session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start payment process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPayment = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount >= 1) {
      handlePayment(amount);
    } else {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount ($1 minimum).',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-base">Did this save you time?</CardTitle>
        <p className="text-xs text-muted-foreground">
          Support development with a tip
        </p>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {predefinedAmounts.map(({ amount, label, icon: Icon }) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handlePayment(amount)}
              disabled={loading}
              className="flex items-center gap-1 flex-1 hover:bg-primary/5"
            >
              <Icon className="w-3 h-3" />
              ${amount}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Custom ($1 min)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            min="1"
            step="1"
            disabled={loading}
            className="flex-1 text-sm"
          />
          <Button 
            onClick={handleCustomPayment}
            disabled={loading || !customAmount}
            size="sm"
          >
            Pay ${customAmount || '0'}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Optional • Secure via Stripe
        </p>
      </CardContent>
    </Card>
  );
};