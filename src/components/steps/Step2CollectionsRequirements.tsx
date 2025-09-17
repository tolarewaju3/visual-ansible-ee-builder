import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, X, Upload, Package, Layers, Search, FileText, Save, ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SavePresetDialog } from "@/components/SavePresetDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
const systemPackages = [{
  name: "wget",
  description: "Download files from web",
  category: "network"
}, {
  name: "vim",
  description: "Text editor",
  category: "utilities"
}, {
  name: "nano",
  description: "Simple text editor",
  category: "utilities"
}, {
  name: "openssh-client",
  description: "SSH client",
  category: "network"
}, {
  name: "rsync",
  description: "File synchronization",
  category: "utilities"
}, {
  name: "unzip",
  description: "Archive extraction",
  category: "utilities"
}, {
  name: "python3-dev",
  description: "Python development headers",
  category: "development"
}, {
  name: "gcc",
  description: "GNU Compiler Collection",
  category: "development"
}];
const popularCollections = [{
  name: "ansible.posix",
  description: "POSIX utilities and modules",
  version: "1.5.4"
}, {
  name: "community.general",
  description: "General community modules",
  version: "7.2.1"
}, {
  name: "community.crypto",
  description: "Cryptographic modules",
  version: "2.15.1"
}, {
  name: "ansible.windows",
  description: "Windows automation",
  version: "1.14.0"
}, {
  name: "community.kubernetes",
  description: "Kubernetes management",
  version: "2.0.1"
}, {
  name: "community.docker",
  description: "Docker container management",
  version: "3.4.8"
}];
interface Collection {
  name: string;
  version?: string;
}
interface Step2CollectionsRequirementsProps {
  selectedCollections: Collection[];
  requirements: string[];
  selectedPackages: string[];
  baseImage: string;
  onCollectionsChange: (collections: Collection[]) => void;
  onRequirementsChange: (requirements: string[]) => void;
  onPackagesChange: (packages: string[]) => void;
}

// Step 2: Collections & Requirements Component
export function Step2CollectionsRequirements({
  selectedCollections,
  requirements,
  selectedPackages,
  baseImage,
  onCollectionsChange,
  onRequirementsChange,
  onPackagesChange
}: Step2CollectionsRequirementsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [customRequirement, setCustomRequirement] = useState("");
  const [customPackage, setCustomPackage] = useState("");
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  const [customCollection, setCustomCollection] = useState("");
  const [customCollectionVersion, setCustomCollectionVersion] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const handleSavePreset = () => {
    setShowSaveDialog(true);
  };
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
  const addCollection = (collection: {
    name: string;
    description: string;
    version: string;
  }) => {
    if (!selectedCollections.find(c => c.name === collection.name)) {
      onCollectionsChange([...selectedCollections, {
        name: collection.name,
        version: collection.version
      }]);
    }
  };
  const removeCollection = (name: string) => {
    onCollectionsChange(selectedCollections.filter(c => c.name !== name));
  };
  const isValidCollectionName = (name: string): boolean => {
    const collectionPattern = /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/;
    return collectionPattern.test(name);
  };
  const addCustomCollection = () => {
    const trimmedName = customCollection.trim();
    if (trimmedName && !selectedCollections.find(c => c.name === trimmedName)) {
      if (!isValidCollectionName(trimmedName)) {
        return; // Invalid format, don't add
      }
      const newCollection: Collection = {
        name: trimmedName,
        version: customCollectionVersion.trim() || undefined
      };
      onCollectionsChange([...selectedCollections, newCollection]);
      setCustomCollection("");
      setCustomCollectionVersion("");
    }
  };
  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      onRequirementsChange([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };
  const removeRequirement = (req: string) => {
    onRequirementsChange(requirements.filter(r => r !== req));
  };
  const parseRequirementsText = () => {
    const newReqs = requirementsText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#')).filter(line => !requirements.includes(line));
    onRequirementsChange([...requirements, ...newReqs]);
    setRequirementsText("");
  };
  const filteredCollections = popularCollections.filter(collection => collection.name.toLowerCase().includes(searchQuery.toLowerCase()) || collection.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPackages = systemPackages.filter(pkg => pkg.name.toLowerCase().includes(packageSearchQuery.toLowerCase()) || pkg.description.toLowerCase().includes(packageSearchQuery.toLowerCase()));
  const groupedPackages = filteredPackages.reduce((acc, pkg) => {
    if (!acc[pkg.category]) {
      acc[pkg.category] = [];
    }
    acc[pkg.category].push(pkg);
    return acc;
  }, {} as Record<string, typeof systemPackages>);
  return <div className="space-y-6">
      {/* Ansible Collections */}
      <Collapsible open={collectionsOpen} onOpenChange={setCollectionsOpen}>
        <Card className="bg-card border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span>Ansible Collections</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${collectionsOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Tabs defaultValue="individual" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual">Add Individual</TabsTrigger>
                  <TabsTrigger value="browse">Browse Popular</TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <div className="flex-1 space-y-1">
                        <Input placeholder="e.g., community.general" value={customCollection} onChange={e => setCustomCollection(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomCollection()} className={`flex-1 ${customCollection.trim() && !isValidCollectionName(customCollection.trim()) ? 'border-destructive' : ''}`} />
                        {customCollection.trim() && !isValidCollectionName(customCollection.trim()) && <p className="text-xs text-destructive">Format must be namespace.collection</p>}
                      </div>
                      <Input placeholder="Version (optional)" value={customCollectionVersion} onChange={e => setCustomCollectionVersion(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomCollection()} className="w-32" />
                      <Button onClick={addCustomCollection} disabled={!customCollection.trim() || !isValidCollectionName(customCollection.trim())}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="browse" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search collections..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Popular Collections</h4>
                    <div className="grid gap-2 max-h-48 overflow-y-auto">
                      {filteredCollections.map(collection => <div key={collection.name} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-foreground">{collection.name}</span>
                              <Badge variant="outline" className="text-xs">v{collection.version}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{collection.description}</p>
                          </div>
                          <Button size="sm" onClick={() => addCollection(collection)} disabled={selectedCollections.some(c => c.name === collection.name)} className="ml-2">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>)}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-foreground">Selected Collections</h4>
                {selectedCollections.length === 0 ? <p className="text-sm text-muted-foreground">No collections selected</p> : <div className="flex flex-wrap gap-2">
                    {selectedCollections.map(collection => <Badge key={collection.name} variant="secondary" className="flex items-center gap-2">
                        <span>{collection.name}</span>
                        {collection.version && <span className="text-xs text-muted-foreground">v{collection.version}</span>}
                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeCollection(collection.name)} />
                      </Badge>)}
                  </div>}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Separator />

      {/* Python Requirements */}
      <Collapsible open={requirementsOpen} onOpenChange={setRequirementsOpen}>
        <Card className="bg-card border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Python Requirements</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${requirementsOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Tabs defaultValue="individual" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual">Add Individual</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="space-y-4">
                  <div className="flex space-x-2">
                    <Input placeholder="e.g., requests>=2.28.0" value={newRequirement} onChange={e => setNewRequirement(e.target.value)} onKeyPress={e => e.key === 'Enter' && addRequirement()} className="flex-1" />
                    <Button onClick={addRequirement}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-4">
                  <div className="space-y-2">
                    <Textarea placeholder="Paste requirements.txt content here..." value={requirementsText} onChange={e => setRequirementsText(e.target.value)} className="min-h-24 font-mono text-sm" />
                    <Button onClick={parseRequirementsText} className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Requirements
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-foreground">Current Requirements</h4>
                {requirements.length === 0 ? <p className="text-sm text-muted-foreground">No requirements specified</p> : <div className="space-y-2">
                    {requirements.map(req => <div key={req} className="flex items-center justify-between p-2 border border-border rounded-lg">
                        <code className="text-sm font-mono text-foreground">{req}</code>
                        <Button size="sm" variant="ghost" onClick={() => removeRequirement(req)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>)}
                  </div>}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* System Packages */}
      <Collapsible open={packagesOpen} onOpenChange={setPackagesOpen}>
        <Card className="bg-card border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span>System Packages</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${packagesOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <Tabs defaultValue="custom" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">Add Custom</TabsTrigger>
                  <TabsTrigger value="browse">Browse Packages</TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search packages..." value={packageSearchQuery} onChange={e => setPackageSearchQuery(e.target.value)} className="pl-10" />
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(groupedPackages).map(([category, packages]) => <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground capitalize">
                          {category} ({packages.length})
                        </h4>
                        <div className="grid gap-2">
                          {packages.map(pkg => <div key={pkg.name} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <code className="text-sm font-mono text-foreground">{pkg.name}</code>
                                  <Badge variant="outline" className="text-xs">{pkg.category}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>
                              </div>
                              <Button size="sm" onClick={() => addPackage(pkg.name)} disabled={selectedPackages.includes(pkg.name)} className="ml-2">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>)}
                        </div>
                      </div>)}
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div className="flex space-x-2">
                    <Input placeholder="e.g., htop" value={customPackage} onChange={e => setCustomPackage(e.target.value)} onKeyPress={e => e.key === 'Enter' && addCustomPackage()} className="flex-1" />
                    <Button onClick={addCustomPackage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Selected Packages</h4>
                {selectedPackages.length === 0 ? <p className="text-sm text-muted-foreground">No packages selected</p> : <div className="flex flex-wrap gap-2">
                    {selectedPackages.map(pkg => <Badge key={pkg} variant="secondary" className="flex items-center gap-2">
                        <span className="font-mono">{pkg}</span>
                        <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removePackage(pkg)} />
                      </Badge>)}
                  </div>}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Save Preset Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            {user ? <Button variant="outline" size="lg" onClick={handleSavePreset} className="w-full">
                <Save className="h-5 w-5 mr-2" />
                Save as Preset
              </Button> : <Button variant="outline" size="lg" onClick={() => navigate('/auth')} className="w-full">
                <Save className="h-5 w-5 mr-2" />
                Sign in to Save Preset
              </Button>}
          </div>
        </CardContent>
      </Card>

      <SavePresetDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} baseImage={baseImage} collections={selectedCollections} requirements={requirements} packages={selectedPackages} onSuccess={() => {
      toast.success('Preset saved successfully!');
    }} />
    </div>;
}