import { useState } from 'react';
import { Heart, Coffee, Pizza, Zap } from 'lucide-react';
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
    { amount: 5, label: 'Coffee', icon: Coffee, description: 'Buy me a coffee' },
    { amount: 15, label: 'Pizza', icon: Pizza, description: 'Pizza slice' },
    { amount: 25, label: 'Support', icon: Zap, description: 'Show support' },
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
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <CardTitle className="text-lg">Did this save you time?</CardTitle>
          <Heart className="w-5 h-5 text-pink-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          If this tool helped you, consider supporting its development! Every contribution helps keep it free for everyone.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {predefinedAmounts.map(({ amount, label, icon: Icon, description }) => (
            <Button
              key={amount}
              variant="outline"
              size="sm"
              onClick={() => handlePayment(amount)}
              disabled={loading}
              className="flex flex-col gap-1 h-auto py-3 hover:bg-primary/5"
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">${amount}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="Custom amount ($1 min)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
              step="1"
              disabled={loading}
            />
          </div>
          <Button 
            onClick={handleCustomPayment}
            disabled={loading || !customAmount}
            size="sm"
          >
            Pay ${customAmount || '0'}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          💝 Completely optional • All features remain free forever • Secure payment via Stripe
        </p>
      </CardContent>
    </Card>
  );
};