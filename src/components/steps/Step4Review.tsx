import { FileText, Download, AlertTriangle, Save, Package, ChevronDown, Settings, Play, Archive, Monitor, Cloud, CreditCard, Bug } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SavePresetDialog } from "@/components/SavePresetDialog";
import { BuildModal } from "@/components/BuildModal";
import { ReportProblemDialog } from "@/components/ReportProblemDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { useCloudBuilds } from "@/hooks/useCloudBuilds";
import { useToast } from "@/hooks/use-toast";
import { Collection, AdditionalBuildStep } from "@/lib/storage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
interface Step4ReviewProps {
  selectedBaseImage: string;
  selectedCollections: Collection[];
  requirements: string[];
  selectedPackages: string[];
  additionalBuildSteps: AdditionalBuildStep[];
}
export function Step4Review({
  selectedBaseImage,
  selectedCollections,
  requirements,
  selectedPackages,
  additionalBuildSteps
}: Step4ReviewProps) {
  // Component cleaned of all Pro gates - everything is now free
  const {
    user
  } = useAuth();
  const {
    incrementExport
  } = useUsageLimit();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const { 
    cloudBuildsUsed, 
    cloudBuildsRemaining, 
    cloudBuildsTotal,
    canBuild: canCloudBuild, 
    loading: cloudBuildsLoading,
    incrementCloudBuild,
    purchaseBuildPack 
  } = useCloudBuilds();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isGeneratedFilesOpen, setIsGeneratedFilesOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedBuildMethod, setSelectedBuildMethod] = useState<'local' | 'cloud'>('local');

  // Build options state
  const [imageTag, setImageTag] = useState('my-ee:latest');
  const [runtime, setRuntime] = useState('auto');

  // Registry credentials state
  const [registryUsername, setRegistryUsername] = useState('');
  const [registryPassword, setRegistryPassword] = useState('');

  // Build modal state
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [currentRunUrl, setCurrentRunUrl] = useState<string | undefined>(undefined);
  const [buildError, setBuildError] = useState<string | null>(null);

  // Container image validation function for local builds
  const isValidContainerImage = (image: string): boolean => {
    // Regex to validate container image format: [registry[:port]/]namespace/name[:tag]
    const imagePattern = /^(?:(?:[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(?::[0-9]+)?\/)?(?:[a-zA-Z0-9._-]+\/)*)?[a-zA-Z0-9._-]+(?::[a-zA-Z0-9._-]+)?$/;
    return imagePattern.test(image.trim());
  };

  // Cloud build validation - requires registry.com/namespace/image:tag format
  const isValidCloudImage = (image: string): boolean => {
    // Must have registry.domain/namespace/image format, tag is optional
    const cloudPattern = /^[a-zA-Z0-9.-]+(?:\.[a-zA-Z]{2,})?(?::[0-9]+)?\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+(?::[a-zA-Z0-9._-]+)?$/;
    return cloudPattern.test(image.trim());
  };

  // Check if image tag is valid for current build method
  const isImageTagValid = selectedBuildMethod === 'cloud' ? isValidCloudImage(imageTag) : isValidContainerImage(imageTag);

  // Packages that require Red Hat subscription
  const redHatSubscriptionPackages = ['telnet', 'tcpdump'];

  // Check if any selected packages require Red Hat subscription
  const hasRedHatPackages = selectedPackages.some(pkg => redHatSubscriptionPackages.includes(pkg.toLowerCase()));
  const redHatPackagesFound = selectedPackages.filter(pkg => redHatSubscriptionPackages.includes(pkg.toLowerCase()));
  const generateExecutionEnvironment = () => {
    const collections = selectedCollections.map(c => c.version ? `${c.name}:${c.version}` : c.name);
    const dependenciesLines = ['  ansible_core:', '    package_pip: ansible-core==2.14.4', '  ansible_runner:', '    package_pip: ansible-runner'];
    if (selectedCollections.length > 0) {
      dependenciesLines.push('  galaxy: requirements.yml');
    }
    if (requirements.length > 0) {
      dependenciesLines.push('  python: requirements.txt');
    }
    if (selectedPackages.length > 0) {
      dependenciesLines.push('  system: bindep.txt');
    }
    let content = `---
version: 3

images:
  base_image:
    name: '${selectedBaseImage}'

dependencies:
${dependenciesLines.join('\n')}`;

    // Add additional_build_steps if any are defined
    if (additionalBuildSteps.length > 0) {
      const buildStepsGroups: Record<string, string[]> = {};
      additionalBuildSteps.forEach(step => {
        if (!buildStepsGroups[step.stepType]) {
          buildStepsGroups[step.stepType] = [];
        }
        buildStepsGroups[step.stepType].push(...step.commands);
      });
      content += '\n\nadditional_build_steps:';
      Object.entries(buildStepsGroups).forEach(([stepType, commands]) => {
        content += `\n  ${stepType}:`;
        commands.forEach(command => {
          content += `\n    - ${command}`;
        });
      });
    }
    return content;
  };
  const generateRequirementsTxt = () => {
    return requirements.join('\n');
  };
  const generateBindepsTxt = () => {
    return selectedPackages.join('\n');
  };
  const generateRequirementsYml = () => {
    return `---
collections:
${selectedCollections.map(c => `  - name: ${c.name}${c.version ? `\n    version: "${c.version}"` : ''}`).join('\n')}`;
  };
  const generateBuildScript = () => {
    return `#!/bin/bash

# Build script for Ansible Execution Environment
# Generated by Ansible EE Builder

set -e  # Exit on any error

IMAGE_TAG="${imageTag}"
RUNTIME="${runtime}"

echo "Building Ansible Execution Environment..."
echo "Image tag: $IMAGE_TAG"
echo "Runtime: $RUNTIME"
echo ""

# Check if ansible-builder is installed
if ! command -v ansible-builder &> /dev/null; then
  echo "Error: ansible-builder is not installed"
  echo "Please install ansible-builder: pip install ansible-builder"
  exit 1
fi

# Auto-detect runtime if not specified
if [ "$RUNTIME" = "auto" ]; then
  if command -v podman &> /dev/null; then
    RUNTIME="podman"
    echo "Auto-detected runtime: podman"
  elif command -v docker &> /dev/null; then
    RUNTIME="docker"
    echo "Auto-detected runtime: docker"
  else
    echo "Error: Neither podman nor docker found"
    echo "Please install either podman or docker to build the execution environment"
    exit 1
  fi
fi

# Check if runtime is available
if ! command -v "$RUNTIME" &> /dev/null; then
  echo "Error: $RUNTIME is not installed or not in PATH"
  exit 1
fi

echo "Building execution environment with ansible-builder using $RUNTIME..."

# Build with ansible-builder
echo "Building image..."
ansible-builder build -v3 -t "$IMAGE_TAG" --container-runtime "$RUNTIME"

if [ $? -eq 0 ]; then
  echo "Build completed successfully!"
else
  echo "Error: Build failed"
  exit 1
fi

echo "Done!"
`;
  };
  const handleExportBuildPackage = async () => {
    setIsExporting(true);
    try {
      // Increment export count for analytics tracking
      await incrementExport();
      const zip = new JSZip();

      // Add all generated files to the zip
      zip.file("execution-environment.yml", generateExecutionEnvironment());

      // Only include requirements.yml if there are collections
      if (selectedCollections.length > 0) {
        zip.file("requirements.yml", generateRequirementsYml());
      }

      // Only include requirements.txt if there are Python requirements
      if (requirements.length > 0) {
        zip.file("requirements.txt", generateRequirementsTxt());
      }

      // Only include bindep.txt if there are system packages
      if (selectedPackages.length > 0) {
        zip.file("bindep.txt", generateBindepsTxt());
      }

      // Add build script
      zip.file("build.sh", generateBuildScript());

      // Add README
      const readme = `# Ansible Execution Environment Build Package

This package contains all the files needed to build your Ansible Execution Environment locally.

## Files included:
- \`execution-environment.yml\`: Main EE configuration file
${selectedCollections.length > 0 ? '- `requirements.yml`: Ansible collections to install\n' : ''}${requirements.length > 0 ? '- `requirements.txt`: Python packages to install\n' : ''}${selectedPackages.length > 0 ? '- `bindep.txt`: System packages to install\n' : ''}- \`build.sh\`: Build script to create the container image
- \`README.md\`: This file

## Building the Execution Environment

1. Make the build script executable:
   \`\`\`bash
   chmod +x build.sh
   \`\`\`

2. Run the build script:
   \`\`\`bash
   ./build.sh
   \`\`\`

The script will automatically detect whether to use podman or docker and build the image with tag \`${imageTag}\`.

## Requirements

- Either podman or docker must be installed
- Access to the internet for downloading base images and dependencies

## Customization

You can modify the build options by editing the variables at the top of the \`build.sh\` script:
- \`IMAGE_TAG\`: Change the image name and tag
- \`RUNTIME\`: Force a specific runtime (podman/docker)
`;
      zip.file("README.md", readme);

      // Generate and download the zip file
      const content = await zip.generateAsync({
        type: "blob"
      });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ee-build-package.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Export successful!",
        description: "Your build package has been downloaded."
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "There was an error creating your build package. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  const handleCloudBuild = async () => {
    if (!canCloudBuild) {
      toast({
        title: "No builds remaining",
        description: "Purchase more cloud builds to continue.",
        variant: "destructive"
      });
      return;
    }

    if (!imageTag || !isImageTagValid) {
      toast({
        title: "Invalid image tag",
        description: "Please enter a valid container image tag.",
        variant: "destructive"
      });
      return;
    }
    if (!registryUsername || !registryPassword) {
      toast({
        title: "Registry credentials required",
        description: "Please enter your registry username and password.",
        variant: "destructive"
      });
      return;
    }
    
    // Open build modal immediately when button is clicked
    setShowBuildModal(true);
    setIsExporting(true);
    setBuildStatus('building');
    
    try {
      // Increment cloud build count first
      await incrementCloudBuild();
      
      // Increment export count for analytics tracking  
      await incrementExport();

      // Create ZIP with EE files
      const zip = new JSZip();

      // Add execution environment files
      zip.file("execution-environment.yml", generateExecutionEnvironment());
      if (selectedCollections.length > 0) {
        zip.file("requirements.yml", generateRequirementsYml());
      }
      if (requirements.length > 0) {
        zip.file("requirements.txt", generateRequirementsTxt());
      }
      if (selectedPackages.length > 0) {
        zip.file("bindep.txt", generateBindepsTxt());
      }

      // Generate base64 encoded zip
      const zipBlob = await zip.generateAsync({
        type: "base64"
      });

      // Call Supabase function to trigger GitHub workflow
      const {
        data,
        error
      } = await supabase.functions.invoke('trigger-github-workflow', {
        body: {
          image: imageTag,
          eeZipB64: zipBlob,
          registryUsername: registryUsername,
          registryPassword: registryPassword
        }
      });
      if (error) throw error;
      
      console.log('Build triggered successfully, response:', data);
      
      // Set run information
      if (data.runId) {
        setCurrentRunId(data.runId);
        setCurrentRunUrl(data.runUrl);
        console.log('Got runId immediately:', data.runId);
      } else {
        console.log('No runId yet, will show waiting state');
        // Set a placeholder that will trigger the waiting state
        setCurrentRunId(null);
        setCurrentRunUrl(data.runUrl);
      }
      
      toast({
        title: "Build started!",
        description: "Your Execution Environment build has been triggered. View live progress below.",
      });
    } catch (error) {
      console.error('Cloud build failed:', error);
      const errorMessage = error.message || "Failed to trigger cloud build. Please try again.";
      setBuildError(errorMessage);
      setBuildStatus('error');
      toast({
        title: "Build trigger failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleBuildComplete = (success: boolean) => {
    setBuildStatus(success ? 'success' : 'error');
  };
  
  const handleSavePreset = () => {
    setShowSaveDialog(true);
  };
  return <div className="space-y-8">
      {/* Red Hat Subscription Warning */}
      {hasRedHatPackages && <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Red Hat Subscription Required</AlertTitle>
          <AlertDescription>
            The following packages require a Red Hat subscription: <strong>{redHatPackagesFound.join(', ')}</strong>
            <br />
            Make sure you are building the execution environment on Red Hat Enterprise Linux with a valid subscription.
          </AlertDescription>
        </Alert>}

      {/* Step 1: Set Build Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
            
            <span>Set Build Information</span>
          </CardTitle>
          <CardDescription>
            Configure the image tag and container runtime for building
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-tag">Image Tag</Label>
            <Input id="image-tag" placeholder={selectedBuildMethod === 'cloud' ? 'registry.com/namespace/image:tag' : 'my-ee:latest'} value={imageTag} onChange={e => setImageTag(e.target.value)} className={`${imageTag.trim() && !isImageTagValid ? 'border-destructive' : ''}`} />
            {imageTag.trim() && !isImageTagValid && (
              <p className="text-xs text-destructive">
                {selectedBuildMethod === 'cloud' 
                  ? 'Cloud builds require: registry.com/namespace/image:tag (tag optional)'
                  : 'Invalid format. Use: [registry[:port]/][namespace/]name[:tag]'
                }
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedBuildMethod === 'cloud' 
                ? 'Examples: quay.io/myorg/ee:latest, registry.com/namespace/image'
                : 'Examples: registry.com/namespace/image:tag, namespace/image:tag, image:tag'
              }
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            
          </div>
          
          
        </CardContent>
      </Card>

      {/* Step 2: Choose Build Method */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">2</div>
            
            <span>Choose Build Method</span>
          </CardTitle>
          <CardDescription>
            Select how you want to build your Execution Environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Build Method Selection Tiles */}
          <div className="grid gap-4 md:grid-cols-2">
            <div 
              className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary ${
                selectedBuildMethod === 'local' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedBuildMethod('local')}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Monitor className="h-8 w-8 text-foreground" />
                <h3 className="font-semibold text-foreground">Local Build</h3>
                <p className="text-sm text-muted-foreground">Run locally in your own environment.</p>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-6 cursor-pointer transition-all hover:border-primary ${
                selectedBuildMethod === 'cloud' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onClick={() => setSelectedBuildMethod('cloud')}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <Cloud className="h-8 w-8 text-foreground" />
                <h3 className="font-semibold text-foreground">Build in Cloud</h3>
                <p className="text-sm text-muted-foreground">We'll build & push the image for you.</p>
              </div>
            </div>
          </div>

          {hasRedHatPackages && <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Red Hat Subscription Required</AlertTitle>
              <AlertDescription>
                Your EE includes packages ({redHatPackagesFound.join(', ')}) that require a Red Hat subscription. 
                Make sure your build environment has the necessary entitlements configured.
              </AlertDescription>
            </Alert>}
        </CardContent>
      </Card>

      {/* Step 3: Build Execution Environment */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
            
            <span>Build Execution Environment</span>
          </CardTitle>
          <CardDescription>
            {selectedBuildMethod === 'local' 
              ? 'Execute these commands in your terminal to build the execution environment'
              : 'Enter your registry credentials to build and push your image'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedBuildMethod === 'local' ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg border">
                <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                {`unzip ee-build-package.zip -d ee-build-package && \\
cd ee-build-package && \\
chmod +x build.sh && \\
./build.sh`}
                </pre>
              </div>
              
              {/* Generated Files Dropdown */}
              <Collapsible open={isGeneratedFilesOpen} onOpenChange={setIsGeneratedFilesOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>View Generated Files</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isGeneratedFilesOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                    {/* execution-environment.yml */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">execution-environment.yml</h4>
                      <Textarea value={generateExecutionEnvironment()} readOnly rows={Math.min(generateExecutionEnvironment().split('\n').length, 10)} className="font-mono text-xs bg-background text-foreground border resize-none" />
                    </div>

                    {/* requirements.yml */}
                    {selectedCollections.length > 0 && <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">requirements.yml</h4>
                        <Textarea value={generateRequirementsYml()} readOnly rows={Math.min(generateRequirementsYml().split('\n').length, 8)} className="font-mono text-xs bg-background text-foreground border resize-none" />
                      </div>}

                    {/* requirements.txt */}
                    {requirements.length > 0 && <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">requirements.txt</h4>
                        <Textarea value={generateRequirementsTxt()} readOnly rows={Math.min(generateRequirementsTxt().split('\n').length, 6)} className="font-mono text-xs bg-background text-foreground border resize-none" />
                      </div>}

                    {/* bindep.txt */}
                    {selectedPackages.length > 0 && <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">bindep.txt</h4>
                        <Textarea value={generateBindepsTxt()} readOnly rows={Math.min(generateBindepsTxt().split('\n').length, 6)} className="font-mono text-xs bg-background text-foreground border resize-none" />
                      </div>}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button onClick={handleExportBuildPackage} disabled={isExporting} className="w-full" size="lg">
                <Archive className="h-4 w-4 mr-2" />
                {isExporting ? 'Preparing Files...' : 'Download Build Files'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Registry Credentials */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="registry-username-cloud">Username</Label>
                  <Input 
                    id="registry-username-cloud" 
                    type="text" 
                    placeholder="Your username" 
                    value={registryUsername} 
                    onChange={e => setRegistryUsername(e.target.value)} 
                    className="font-mono text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registry-password-cloud">Password (Access Token Recommended)</Label>
                  <Input 
                    id="registry-password-cloud" 
                    type="password" 
                    placeholder="Your password/token" 
                    value={registryPassword} 
                    onChange={e => setRegistryPassword(e.target.value)} 
                    className="font-mono text-sm" 
                  />
                </div>
              </div>

              {/* Cloud Build Usage Display */}
              <div className="bg-muted/20 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Cloud Builds</h4>
                  <Badge variant="secondary">
                    {cloudBuildsRemaining} / {cloudBuildsTotal} remaining
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(cloudBuildsUsed / cloudBuildsTotal) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {cloudBuildsRemaining === 0 
                    ? "No builds remaining. Purchase more to continue." 
                    : `You have ${cloudBuildsRemaining} cloud build${cloudBuildsRemaining === 1 ? '' : 's'} remaining.`}
                </p>
              </div>

              {/* Build Actions */}
              {cloudBuildsRemaining === 0 ? (
                <div className="space-y-3">
                  <Button 
                    onClick={purchaseBuildPack}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy 10 More Builds - $5
                  </Button>
                  <p className="text-xs text-muted-foreground/60 text-center">
                    Get 10 additional cloud builds for just $5
                  </p>
                </div>
              ) : currentRunId && buildStatus !== 'idle' ? (
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowBuildModal(true)} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    size="lg"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    {buildStatus === 'building' ? 'View Build Progress' : 'View Build Results'}
                  </Button>
                  <p className="text-xs text-muted-foreground/60 text-center">
                    Build {buildStatus === 'building' ? 'in progress' : buildStatus === 'success' ? 'completed successfully' : 'failed'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    onClick={user ? handleCloudBuild : () => navigate('/auth')} 
                    disabled={user && (isExporting || !isImageTagValid || !registryUsername || !registryPassword || !canCloudBuild)} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {user ? (isExporting ? 'Starting Build...' : 'Build in Cloud') : 'Sign in to Build in Cloud'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground/60 text-center mt-3">
                    {user ? "Your registry credentials are never stored. They're deleted after each build." : "Sign in to access cloud builds"}
                  </p>
                  
                  {/* Report Problem Button - Show when build fails */}
                  {buildStatus === 'error' && buildError && (
                    <div className="pt-3 border-t">
                      <ReportProblemDialog
                        errorDetails={{
                          error: buildError,
                          context: "Cloud build trigger",
                          runId: currentRunId || undefined,
                          runUrl: currentRunUrl
                        }}
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Bug className="h-4 w-4 mr-2" />
                          Report Problem
                        </Button>
                      </ReportProblemDialog>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Save Preset Dialog */}
      <SavePresetDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} baseImage={selectedBaseImage} collections={selectedCollections} requirements={requirements} packages={selectedPackages} additionalBuildSteps={additionalBuildSteps} onSuccess={() => {
      // Optional: Add any additional success handling
    }} />

      {/* Build Modal with Polling Logs */}
      <BuildModal
        isOpen={showBuildModal}
        onClose={() => setShowBuildModal(false)}
        runId={currentRunId}
        runUrl={currentRunUrl}
        buildStatus={buildStatus}
        isBuilding={isExporting}
        onBuildComplete={handleBuildComplete}
      />
    </div>;
}