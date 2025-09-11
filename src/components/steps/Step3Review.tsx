import { FileText, Download, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  selectedPackages,
}: Step3ReviewProps) {
  const generateExecutionEnvironment = () => {
    const collections = selectedCollections.map(c => 
      c.version ? `${c.name}:${c.version}` : c.name
    );

    return `---
version: 3

images:
  base_image:
    name: '${selectedBaseImage}'

dependencies:
  galaxy: requirements.yml
  python: requirements.txt
  system: bindep.txt

additional_build_steps:
  prepend_base:
    - RUN whoami
    - RUN cat /etc/os-release
  append_final:
    - RUN whoami
    - RUN ls -la /etc`;
  };

  const generateRequirementsTxt = () => {
    return requirements.join('\n') || '# No Python requirements specified';
  };

  const generateBindepsTxt = () => {
    return selectedPackages.join('\n') || '# No system packages specified';
  };

  const generateRequirementsYml = () => {
    if (selectedCollections.length === 0) {
      return '# No collections specified';
    }
    
    return `---
collections:
${selectedCollections.map(c => `  - name: ${c.name}${c.version ? `\n    version: "${c.version}"` : ''}`).join('\n')}`;
  };

  const handleExportAll = async () => {
    const zip = new JSZip();
    
    // Add all generated files to the zip
    zip.file("execution-environment.yml", generateExecutionEnvironment());
    zip.file("requirements.yml", generateRequirementsYml());
    zip.file("requirements.txt", generateRequirementsTxt());
    zip.file("bindep.txt", generateBindepsTxt());
    
    // Generate and download the zip file
    const content = await zip.generateAsync({ type: "blob" });
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Review Configuration</h1>
        <p className="text-muted-foreground">
          Review your execution environment configuration before building
        </p>
      </div>

      <div className="space-y-6">
        {/* Configuration Summary */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Base Image
                </h4>
                <Badge variant="outline" className="font-mono text-xs">
                  {selectedBaseImage}
                </Badge>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Collections ({selectedCollections.length})
                </h4>
                {selectedCollections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No collections selected</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedCollections.map((collection, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs">
                        {collection.name}
                        {collection.version && `:${collection.version}`}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Requirements ({requirements.length})
                </h4>
                {requirements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No requirements specified</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Packages ({selectedPackages.length})
                </h4>
                {selectedPackages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No packages selected</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedPackages.map((pkg, index) => (
                      <Badge key={index} variant="outline" className="font-mono text-xs">
                        {pkg}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Files */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Generated Files</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md border border-border bg-background hover:bg-muted text-left transition-colors">
                <span className="text-sm font-medium text-foreground">execution-environment.yml</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 px-1">
                <Textarea
                  value={generateExecutionEnvironment()}
                  readOnly
                  rows={generateExecutionEnvironment().split('\n').length}
                  className="font-mono text-xs bg-muted/30 text-foreground border resize-none"
                />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md border border-border bg-background hover:bg-muted text-left transition-colors">
                <span className="text-sm font-medium text-foreground">requirements.yml</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 px-1">
                <Textarea
                  value={generateRequirementsYml()}
                  readOnly
                  rows={generateRequirementsYml().split('\n').length}
                  className="font-mono text-xs bg-muted/30 text-foreground border resize-none"
                />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md border border-border bg-background hover:bg-muted text-left transition-colors">
                <span className="text-sm font-medium text-foreground">requirements.txt</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 px-1">
                <Textarea
                  value={generateRequirementsTxt()}
                  readOnly
                  rows={generateRequirementsTxt().split('\n').length}
                  className="font-mono text-xs bg-muted/30 text-foreground border resize-none"
                />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-md border border-border bg-background hover:bg-muted text-left transition-colors">
                <span className="text-sm font-medium text-foreground">bindep.txt</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 px-1">
                <Textarea
                  value={generateBindepsTxt()}
                  readOnly
                  rows={generateBindepsTxt().split('\n').length}
                  className="font-mono text-xs bg-muted/30 text-foreground border resize-none"
                />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}