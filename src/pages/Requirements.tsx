import { useState } from "react";
import { FileText, Plus, X, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Requirements = () => {
  const [requirements, setRequirements] = useState<string[]>([
    "requests>=2.28.0",
    "pyyaml>=6.0"
  ]);
  const [newRequirement, setNewRequirement] = useState("");
  const [requirementsText, setRequirementsText] = useState("");

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (req: string) => {
    setRequirements(requirements.filter(r => r !== req));
  };

  const parseRequirementsText = () => {
    const newReqs = requirementsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .filter(line => !requirements.includes(line));
    
    setRequirements([...requirements, ...newReqs]);
    setRequirementsText("");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Python Requirements</h1>
        <p className="text-muted-foreground">
          Specify Python packages and dependencies for your execution environment
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Python Dependencies</span>
          </CardTitle>
          <CardDescription>
            Add Python packages that your Ansible content requires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="individual" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Add Individual</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="e.g., requests>=2.28.0"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  className="flex-1"
                />
                <Button onClick={addRequirement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste requirements.txt content here..."
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  className="min-h-32 font-mono text-sm"
                />
                <Button onClick={parseRequirementsText} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Requirements
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Current Requirements</h4>
            {requirements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requirements specified</p>
            ) : (
              <div className="space-y-2">
                {requirements.map((req) => (
                  <div key={req} className="flex items-center justify-between p-2 border border-border rounded-lg">
                    <code className="text-sm font-mono text-foreground">{req}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeRequirement(req)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
            <h5 className="text-sm font-medium text-foreground mb-2">Generated requirements.txt</h5>
            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
              {requirements.join('\n') || '# No requirements specified'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Requirements;