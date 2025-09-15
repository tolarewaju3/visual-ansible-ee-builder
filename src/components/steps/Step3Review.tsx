import { FileText, Download, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import JSZip from "jszip";

interface Collection {
  name: string;
  version?: string;
}

interface Step3ReviewProps {
  selectedBaseImage: string;
  selectedCollections: Collection[];
  requirements: string[];
  selectedPackages: string[];
}

export function Step3Review({
  selectedBaseImage,
  selectedCollections,
  requirements,
  selectedPackages
}: Step3ReviewProps) {
  // Packages that require Red Hat subscription
  const redHatSubscriptionPackages = ['telnet', 'tcpdump'];
  
  // Check if any selected packages require Red Hat subscription
  const hasRedHatPackages = selectedPackages.some(pkg => 
    redHatSubscriptionPackages.includes(pkg.toLowerCase())
  );
  
  const redHatPackagesFound = selectedPackages.filter(pkg => 
    redHatSubscriptionPackages.includes(pkg.toLowerCase())
  );
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
    return `---
version: 3

images:
  base_image:
    name: '${selectedBaseImage}'

dependencies:
${dependenciesLines.join('\n')}`;
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

  const handleExportAll = async () => {
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

    // Generate and download the zip file
    const content = await zip.generateAsync({
      type: "blob"
    });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ee.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Build Execution Environment</h1>
        <p className="text-muted-foreground">
          Generate execution environment files
        </p>
      </div>

      <div className="space-y-6">
        {/* Red Hat Subscription Warning */}
        {hasRedHatPackages && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Red Hat Subscription Required</AlertTitle>
            <AlertDescription>
              The following packages require a Red Hat subscription: <strong>{redHatPackagesFound.join(', ')}</strong>
              <br />
              Make sure you are building the exeuction environment on Red Hat Enterprise Linux with a valid subscription.
            </AlertDescription>
          </Alert>
        )}

        {/* Generated Files */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Generated Files</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* execution-environment.yml */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">execution-environment.yml</h4>
              <Textarea 
                value={generateExecutionEnvironment()} 
                readOnly 
                rows={generateExecutionEnvironment().split('\n').length} 
                className="font-mono text-xs bg-muted/30 text-foreground border resize-none" 
              />
            </div>

            {/* requirements.yml */}
            {selectedCollections.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">requirements.yml</h4>
                <Textarea 
                  value={generateRequirementsYml()} 
                  readOnly 
                  rows={generateRequirementsYml().split('\n').length} 
                  className="font-mono text-xs bg-muted/30 text-foreground border resize-none" 
                />
              </div>
            )}

            {/* requirements.txt */}
            {requirements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">requirements.txt</h4>
                <Textarea 
                  value={generateRequirementsTxt()} 
                  readOnly 
                  rows={generateRequirementsTxt().split('\n').length} 
                  className="font-mono text-xs bg-muted/30 text-foreground border resize-none" 
                />
              </div>
            )}

            {/* bindep.txt */}
            {selectedPackages.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">bindep.txt</h4>
                <Textarea 
                  value={generateBindepsTxt()} 
                  readOnly 
                  rows={generateBindepsTxt().split('\n').length} 
                  className="font-mono text-xs bg-muted/30 text-foreground border resize-none" 
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export All Button */}
        <Button size="lg" className="w-full" onClick={handleExportAll}>
          <Download className="h-5 w-5 mr-2" />
          Export All
        </Button>
      </div>
    </div>
  );
}