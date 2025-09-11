import { useState } from "react";
import { Play, Download, Settings, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface Collection {
  name: string;
  version?: string;
}

interface Step4BuildProps {
  selectedBaseImage: string;
  selectedCollections: Collection[];
  requirements: string[];
  selectedPackages: string[];
}

export function Step4Build({
  selectedBaseImage,
  selectedCollections,
  requirements,
  selectedPackages,
}: Step4BuildProps) {
  const [imageName, setImageName] = useState("my-ansible-ee");
  const [imageTag, setImageTag] = useState("latest");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [buildLogs, setBuildLogs] = useState("");

  const startBuild = () => {
    setIsBuilding(true);
    setBuildStatus('building');
    setBuildProgress(0);
    setBuildLogs("Starting build process...\n");

    // Simulate build process
    const steps = [
      "Setting up build environment...",
      "Installing collections...",
      "Installing Python requirements...",
      "Installing system packages...",
      "Building container image...",
      "Pushing to registry..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setBuildProgress((currentStep / steps.length) * 100);
      setBuildLogs(prev => prev + `${steps[currentStep - 1]}\n`);

      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsBuilding(false);
        setBuildStatus('success');
        setBuildLogs(prev => prev + "Build completed successfully!\n");
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Build & Deploy</h1>
        <p className="text-muted-foreground">
          Build and deploy your execution environment
        </p>
      </div>

      <div className="space-y-6">
        {/* Build Configuration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Build Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imageName">Image Name</Label>
                <Input 
                  id="imageName" 
                  value={imageName} 
                  onChange={(e) => setImageName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageTag">Tag</Label>
                <Input 
                  id="imageTag" 
                  value={imageTag} 
                  onChange={(e) => setImageTag(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Button 
                onClick={startBuild} 
                disabled={isBuilding}
                className="w-full"
                size="lg"
              >
                {isBuilding ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Building...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Build
                  </>
                )}
              </Button>

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
            </div>
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
    </div>
  );
}