import { useState } from 'react';
import { Crown, Check, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscriptionService } from '@/lib/subscriptionService';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: 'export-limit' | 'preset-save' | 'manual';
}

export const UpgradeModal = ({ open, onOpenChange, trigger }: UpgradeModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const checkoutUrl = await subscriptionService.createCheckoutSession('pro');
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start upgrade process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'export-limit':
        return 'You\'ve reached your daily export limit. Upgrade to Pro for unlimited exports.';
      case 'preset-save':
        return 'Saving presets is a Pro feature. Upgrade to create and manage custom presets.';
      default:
        return 'Unlock unlimited exports and preset management with Pro.';
    }
  };

  const freeFeatures = [
    '3 build package exports per day',
    'Read-only access to presets',
    'All base images and collections',
    'Community support'
  ];

  const proFeatures = [
    'Unlimited build package exports',
    'Create and save custom presets',
    'Edit and manage your presets',
    'Priority support',
    'Early access to new features'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            {getTriggerMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {/* Free Plan */}
          <Card className="border-muted">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Free</CardTitle>
              <div className="text-2xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary bg-primary/5 relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Recommended
              </div>
            </div>
            <CardHeader className="pb-4 pt-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Pro
              </CardTitle>
              <div className="text-2xl font-bold">$5<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 mb-4">
                {proFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                onClick={handleUpgrade} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};