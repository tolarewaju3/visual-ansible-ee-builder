import { Download, CheckCircle, XCircle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildProgress: number;
  buildStatus: 'idle' | 'building' | 'success' | 'error';
  buildLogs: string;
  isBuilding: boolean;
}

export function BuildModal({
  isOpen,
  onClose,
  buildProgress,
  buildStatus,
  buildLogs,
  isBuilding,
}: BuildModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Build & Deploy</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Build Progress and Logs */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Build Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {buildStatus !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(buildProgress)}%</span>
                  </div>
                  <Progress value={buildProgress} className="w-full" />
                </div>
              )}

              {buildStatus === 'success' && (
                <Alert className="border-success/50 bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success-foreground">
                    Build completed successfully! Your execution environment is ready.
                  </AlertDescription>
                </Alert>
              )}

              {buildStatus === 'error' && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive-foreground">
                    Build failed. Check the logs for more details.
                  </AlertDescription>
                </Alert>
              )}

              {buildLogs && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Build Logs</Label>
                  <Textarea
                    value={buildLogs}
                    readOnly
                    className="font-mono text-xs bg-code text-terminal-green border resize-none"
                    rows={Math.min(buildLogs.split('\n').length, 15)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Download Options */}
          {buildStatus === 'success' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Download Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Build Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}