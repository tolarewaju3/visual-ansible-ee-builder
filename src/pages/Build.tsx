import { useState } from "react";
import { Play, Download, FileText, Settings, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface BuildConfig {
  imageName: string;
  imageTag: string;
  collections: string[];
  requirements: string[];
  packages: string[];
}

const Build = () => {
  const [buildConfig] = useState<BuildConfig>({
    imageName: "my-ansible-ee",
    imageTag: "latest",
    collections: ["ansible.posix:1.5.4", "community.general:7.2.1"],
    requirements: ["requests>=2.28.0", "pyyaml>=6.0"],
    packages: ["git", "curl", "openssh-client"]
  });

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

  const generateDockerfile = () => {
    return `FROM quay.io/ansible/ansible-runner:latest

# Install system packages
RUN apt-get update && apt-get install -y \\
    ${buildConfig.packages.join(' \\\n    ')} \\
    && apt-get clean \\
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

# Install Ansible collections
RUN ansible-galaxy collection install \\
    ${buildConfig.collections.join(' \\\n    ')}

# Set working directory
WORKDIR /runner

# Default command
CMD ["ansible-runner"]`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Build Configuration</h1>
        <p className="text-muted-foreground">
          Review your configuration and build the execution environment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Build Configuration */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Image Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageName">Image Name</Label>
                  <Input id="imageName" value={buildConfig.imageName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageTag">Tag</Label>
                  <Input id="imageTag" value={buildConfig.imageTag} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Collections ({buildConfig.collections.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {buildConfig.collections.map((collection, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs">
                        {collection}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Requirements ({buildConfig.requirements.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {buildConfig.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Packages ({buildConfig.packages.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {buildConfig.packages.map((pkg, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs">
                        {pkg}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Build Controls and Status */}
        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-primary" />
                <span>Build Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Generated Dockerfile</span>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={generateDockerfile()}
                readOnly
                className="font-mono text-sm min-h-48 bg-code text-foreground"
              />
            </CardContent>
          </Card>

          {buildLogs && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Build Logs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={buildLogs}
                  readOnly
                  className="font-mono text-sm min-h-32 bg-code text-terminal-green resize-none"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Build;