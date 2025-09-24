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
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Support the Project</h3>
        <p className="text-muted-foreground">Help us keep building amazing tools for you</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {predefinedAmounts.map((item) => (
          <Card key={item.amount} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 text-center space-y-2">
              <item.icon className="w-8 h-8 mx-auto text-primary" />
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-lg font-bold">${item.amount}</p>
              </div>
              <Button 
                onClick={() => handlePayment(item.amount)}
                disabled={loading}
                className="w-full"
                size="sm"
              >
                {loading ? "Processing..." : "Pay"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};