import { useState } from 'react';
import { Coffee, Zap, Heart } from 'lucide-react';
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
    amount: 5,
    label: 'Coffee',
    icon: Coffee
  }];
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
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <Card className="border-dashed border-2 border-muted-foreground/20 bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-left">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <div>
              <h3 className="text-base font-semibold leading-none tracking-tight">Did this save you time?</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Support development with a tip
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {predefinedAmounts.map(({
            amount,
            label,
            icon: Icon
          }) => <Button key={amount} variant="outline" size="sm" onClick={() => handlePayment(amount)} disabled={loading} className="flex items-center gap-1 hover:bg-primary/5">
                <Icon className="w-3 h-3" />
                ${amount}
              </Button>)}
          </div>
        </div>
        
        
      </CardContent>
    </Card>;
};