import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package } from "lucide-react";
import { Collection } from "@/lib/storage";

interface Step2CollectionsRequirementsProps {
  selectedCollections: Collection[];
  onCollectionsChange: (collections: Collection[]) => void;
  requirements: string[];
  onRequirementsChange: (requirements: string[]) => void;
  selectedPackages: string[];
  onPackagesChange: (packages: string[]) => void;
}

export function Step2CollectionsRequirements({
  selectedCollections,
  onCollectionsChange,
  requirements,
  onRequirementsChange,
  selectedPackages,
  onPackagesChange,
}: Step2CollectionsRequirementsProps) {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionVersion, setNewCollectionVersion] = useState("");
  const [requirementsText, setRequirementsText] = useState(requirements.join("\n"));
  const [newPackage, setNewPackage] = useState("");

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection: Collection = {
        name: newCollectionName.trim(),
        version: newCollectionVersion.trim() || undefined,
      };
      onCollectionsChange([...selectedCollections, newCollection]);
      setNewCollectionName("");
      setNewCollectionVersion("");
    }
  };

  const handleRemoveCollection = (index: number) => {
    const updated = selectedCollections.filter((_, i) => i !== index);
    onCollectionsChange(updated);
  };

  const handleRequirementsChange = (value: string) => {
    setRequirementsText(value);
    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    onRequirementsChange(lines);
  };

  const handleAddPackage = () => {
    if (newPackage.trim() && !selectedPackages.includes(newPackage.trim())) {
      onPackagesChange([...selectedPackages, newPackage.trim()]);
      setNewPackage("");
    }
  };

  const handleRemovePackage = (pkg: string) => {
    onPackagesChange(selectedPackages.filter((p) => p !== pkg));
  };

  return (
    <div className="space-y-6">
      {/* Ansible Collections */}
      <Card>
        <CardHeader>
          <CardTitle>Ansible Collections</CardTitle>
          <CardDescription>
            Add Ansible Galaxy collections to your execution environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                  id="collection-name"
                  placeholder="e.g., community.general"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCollection()}
                />
              </div>
              <div>
                <Label htmlFor="collection-version">Version (optional)</Label>
                <Input
                  id="collection-version"
                  placeholder="e.g., 1.0.0"
                  value={newCollectionVersion}
                  onChange={(e) => setNewCollectionVersion(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCollection()}
                />
              </div>
            </div>
            <Button onClick={handleAddCollection} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Collection
            </Button>
          </div>

          {selectedCollections.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Collections</Label>
              <div className="flex flex-wrap gap-2">
                {selectedCollections.map((collection, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {collection.name}
                    {collection.version && `:${collection.version}`}
                    <button
                      onClick={() => handleRemoveCollection(index)}
                      className="ml-2 hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Python Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Python Requirements</CardTitle>
          <CardDescription>
            Add Python packages (one per line, supports pip format)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="ansible-runner&#10;requests>=2.28.0&#10;boto3"
            value={requirementsText}
            onChange={(e) => handleRequirementsChange(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          {requirements.length > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {requirements.length} requirement{requirements.length !== 1 ? "s" : ""} specified
            </p>
          )}
        </CardContent>
      </Card>

      {/* System Packages */}
      <Card>
        <CardHeader>
          <CardTitle>System Packages</CardTitle>
          <CardDescription>
            Add system-level packages (RPM/DNF packages)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., git, rsync"
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddPackage()}
            />
            <Button onClick={handleAddPackage}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {selectedPackages.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Packages</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPackages.map((pkg) => (
                  <Badge key={pkg} variant="secondary" className="px-3 py-1">
                    <Package className="w-3 h-3 mr-1" />
                    {pkg}
                    <button
                      onClick={() => handleRemovePackage(pkg)}
                      className="ml-2 hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
