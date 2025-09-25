import { Download, CheckCircle, XCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PollingLogs } from "./PollingLogs";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  runId: string | null;
  runUrl?: string;
  buildStatus: 'idle' | 'building' | 'success' | 'error';
  isBuilding: boolean;
  onBuildComplete?: (success: boolean) => void;
}

export function BuildModal({
  isOpen,
  onClose,
  runId,
  runUrl,
  buildStatus,
  isBuilding,
  onBuildComplete,
}: BuildModalProps) {
  const handleBuildComplete = (success: boolean) => {
    if (onBuildComplete) {
      onBuildComplete(success);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Build & Deploy - Live Logs</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Alerts */}
          {buildStatus === 'success' && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Build completed successfully! Your execution environment is ready.
              </AlertDescription>
            </Alert>
          )}

          {buildStatus === 'error' && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                Build failed. Check the logs below for more details.
              </AlertDescription>
            </Alert>
          )}

          {/* Polling Logs */}
          <PollingLogs 
            runId={runId} 
            runUrl={runUrl}
            onComplete={handleBuildComplete}
            className="w-full"
          />

          {/* Download Options */}
          {buildStatus === 'success' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your Execution Environment has been built and pushed to the registry successfully. 
                  You can now use it in your Ansible Automation Platform.
                </p>
                {runUrl && (
                  <Button variant="outline" onClick={() => window.open(runUrl, '_blank')}>
                    View on GitHub Actions
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}