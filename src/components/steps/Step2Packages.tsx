import { useState } from "react";
import { Package, Plus, X, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const systemPackages = [
  { name: "git", description: "Version control system", category: "development" },
  { name: "curl", description: "Transfer data from servers", category: "network" },
  { name: "wget", description: "Download files from web", category: "network" },
  { name: "vim", description: "Text editor", category: "utilities" },
  { name: "nano", description: "Simple text editor", category: "utilities" },
  { name: "openssh-client", description: "SSH client", category: "network" },
  { name: "rsync", description: "File synchronization", category: "utilities" },
  { name: "unzip", description: "Archive extraction", category: "utilities" },
  { name: "python3-dev", description: "Python development headers", category: "development" },
  { name: "gcc", description: "GNU Compiler Collection", category: "development" },
];

interface Step2Props {
  selectedPackages: string[];
  onPackagesChange: (packages: string[]) => void;
}

export function Step2Packages({ selectedPackages, onPackagesChange }: Step2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customPackage, setCustomPackage] = useState("");

  const addPackage = (packageName: string) => {
    if (!selectedPackages.includes(packageName)) {
      onPackagesChange([...selectedPackages, packageName]);
    }
  };

  const removePackage = (packageName: string) => {
    onPackagesChange(selectedPackages.filter(p => p !== packageName));
  };

  const addCustomPackage = () => {
    if (customPackage.trim() && !selectedPackages.includes(customPackage.trim())) {
      onPackagesChange([...selectedPackages, customPackage.trim()]);
      setCustomPackage("");
    }
  };

  const filteredPackages = systemPackages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedPackages = filteredPackages.reduce((acc, pkg) => {
    if (!acc[pkg.category]) {
      acc[pkg.category] = [];
    }
    acc[pkg.category].push(pkg);
    return acc;
  }, {} as Record<string, typeof systemPackages>);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">System Packages</h1>
        <p className="text-muted-foreground">
          Select system packages to install in your execution environment
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>System Dependencies</span>
          </CardTitle>
          <CardDescription>
            Add system packages that your Ansible content requires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="browse" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse">Browse Packages</TabsTrigger>
              <TabsTrigger value="custom">Add Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedPackages).map(([category, packages]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground capitalize">
                      {category} ({packages.length})
                    </h4>
                    <div className="grid gap-2">
                      {packages.map((pkg) => (
                        <div 
                          key={pkg.name}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono text-foreground">{pkg.name}</code>
                              <Badge variant="outline" className="text-xs">{pkg.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addPackage(pkg.name)}
                            disabled={selectedPackages.includes(pkg.name)}
                            className="ml-2"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., htop"
                  value={customPackage}
                  onChange={(e) => setCustomPackage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomPackage()}
                  className="flex-1"
                />
                <Button onClick={addCustomPackage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Selected Packages</h4>
            {selectedPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No packages selected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedPackages.map((pkg) => (
                  <Badge key={pkg} variant="secondary" className="flex items-center gap-2">
                    <span className="font-mono">{pkg}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removePackage(pkg)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h5 className="text-sm font-medium text-foreground mb-2">Package Installation Commands</h5>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {selectedPackages.length > 0 
                ? `RUN apt-get update && apt-get install -y \\\n    ${selectedPackages.join(' \\\n    ')} \\\n    && apt-get clean \\\n    && rm -rf /var/lib/apt/lists/*`
                : '# No packages selected'
              }
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}