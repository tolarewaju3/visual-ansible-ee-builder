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
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-2">Support the Project</h3>
          <p className="text-sm text-muted-foreground">
            Choose an amount to support this open-source project
          </p>
        </div>
        
        <div className="grid gap-3 mb-4">
          {predefinedAmounts.map((item) => (
            <Button
              key={item.amount}
              variant="outline"
              className="flex items-center justify-between p-4 h-auto"
              onClick={() => handlePayment(item.amount)}
              disabled={loading}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              <span className="font-semibold">${item.amount}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </CardContent>
    </Card>
  );
};