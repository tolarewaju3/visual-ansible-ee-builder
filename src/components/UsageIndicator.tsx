import { Download, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useUsageLimit } from '@/hooks/useUsageLimit';

export const UsageIndicator = () => {
  const { isPro } = useSubscription();
  const { todayExports, remainingExports, loading } = useUsageLimit();

  if (loading || isPro) {
    return null;
  }

  const maxExports = 3;
  const progressValue = (todayExports / maxExports) * 100;

  return (
    <Card className="border-muted bg-background/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Download className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Daily Exports</h3>
              <span className="text-xs text-muted-foreground">
                {todayExports}/{maxExports} used
              </span>
            </div>
            
            <Progress value={progressValue} className="h-2 mb-2" />
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {remainingExports > 0 
                  ? `${remainingExports} exports remaining today`
                  : 'Daily limit reached'
                }
              </p>
              
              {remainingExports === 0 && (
                <div className="flex items-center gap-1 text-xs text-amber-600">
                  <Crown className="w-3 h-3" />
                  <span>Upgrade for unlimited</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};