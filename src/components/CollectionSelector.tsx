import { useState } from "react";
import { Search, Plus, X, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const popularCollections = [
  { name: "ansible.posix", description: "POSIX utilities and modules", version: "1.5.4" },
  { name: "community.general", description: "General community modules", version: "7.2.1" },
  { name: "community.crypto", description: "Cryptographic modules", version: "2.15.1" },
  { name: "ansible.windows", description: "Windows automation", version: "1.14.0" },
  { name: "community.kubernetes", description: "Kubernetes management", version: "2.0.1" },
  { name: "community.docker", description: "Docker container management", version: "3.4.8" },
];

interface Collection {
  name: string;
  version?: string;
}

export function CollectionSelector() {
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([
    { name: "ansible.posix", version: "1.5.4" }
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const addCollection = (collection: { name: string; description: string; version: string }) => {
    if (!selectedCollections.find(c => c.name === collection.name)) {
      setSelectedCollections([...selectedCollections, { name: collection.name, version: collection.version }]);
    }
  };

  const removeCollection = (name: string) => {
    setSelectedCollections(selectedCollections.filter(c => c.name !== name));
  };

  const filteredCollections = popularCollections.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Ansible Collections</span>
          </CardTitle>
          <CardDescription>
            Select the Ansible collections to include in your execution environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Selected Collections</h4>
            {selectedCollections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No collections selected</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedCollections.map((collection) => (
                  <Badge key={collection.name} variant="secondary" className="flex items-center gap-2">
                    <span>{collection.name}</span>
                    {collection.version && (
                      <span className="text-xs text-muted-foreground">v{collection.version}</span>
                    )}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeCollection(collection.name)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Popular Collections</h4>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {filteredCollections.map((collection) => (
                <div 
                  key={collection.name}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm text-foreground">{collection.name}</span>
                      <Badge variant="outline" className="text-xs">v{collection.version}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{collection.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addCollection(collection)}
                    disabled={selectedCollections.some(c => c.name === collection.name)}
                    className="ml-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}