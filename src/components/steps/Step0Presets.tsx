import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PRESETS, Preset } from "@/lib/presets";
import { UserPreset, userPresetsService } from "@/lib/userPresets";
import { useAuth } from "@/contexts/AuthContext";
import { Wrench, Trash2, User } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface Step0PresetsProps {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

export function Step0Presets({ selectedPreset, onPresetChange }: Step0PresetsProps) {
  const { user } = useAuth();
  const [userPresets, setUserPresets] = useState<UserPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserPresets();
    }
  }, [user]);

  const loadUserPresets = async () => {
    try {
      setLoading(true);
      const presets = await userPresetsService.getUserPresets();
      setUserPresets(presets);
    } catch (error) {
      console.error('Error loading user presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await userPresetsService.deleteUserPreset(id);
      setUserPresets(userPresets.filter(p => p.id !== id));
      toast({
        title: 'Preset deleted',
        description: 'The preset has been removed from your templates.',
      });
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        title: 'Failed to delete preset',
        description: 'There was an error deleting the preset.',
        variant: 'destructive',
      });
    }
    setDeleteId(null);
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Start from scratch option */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedPreset === 'scratch' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onPresetChange('scratch')}
        >
          <CardHeader className="text-center">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs">Default</Badge>
            </div>
            <div className="text-4xl mb-2">🛠️</div>
            <CardTitle className="text-xl">Start from Scratch</CardTitle>
            <CardDescription>
              Build from the ground up with full control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Includes:</div>
                <div className="text-sm text-muted-foreground">
                  Empty environment with Python 3.11 runtime only
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Base: Python 3.11 on RHEL 9
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Built-in preset options */}
        {PRESETS.map((preset) => (
          <Card 
            key={preset.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPreset === preset.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPresetChange(preset.id)}
          >
            <CardHeader className="text-center">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">Built-in</Badge>
              </div>
              <div className="text-4xl mb-2">{preset.icon}</div>
              <CardTitle className="text-xl">{preset.name}</CardTitle>
              <CardDescription>{preset.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1">Includes:</div>
                  <div className="text-sm text-muted-foreground">
                    {preset.id === 'basic-automation' && (
                      <>POSIX & General collections, HTTP & templating tools</>
                    )}
                    {preset.id === 'network-automation' && (
                      <>Cisco, Arista & Juniper support, SSH & network tools</>
                    )}
                    {preset.id === 'cloud-management' && (
                      <>AWS, Azure & GCP collections, Cloud SDKs & CLI tools</>
                    )}
                    {preset.id === 'container-orchestration' && (
                      <>Kubernetes, Docker & OpenShift collections, Container SDKs</>
                    )}
                    {preset.id === 'security-compliance' && (
                      <>Crypto & POSIX collections, Security tools & certificates</>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Base: Python 3.11 on RHEL 9
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* User preset options */}
        {userPresets.map((preset) => (
          <Card 
            key={`user_${preset.id}`}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPreset === `user_${preset.id}` ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPresetChange(`user_${preset.id}`)}
          >
            <CardHeader className="text-center relative">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Custom
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(preset.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-4xl mb-2">{preset.icon}</div>
              <CardTitle className="text-xl">{preset.name}</CardTitle>
              <CardDescription>{preset.description || 'Custom preset configuration'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1">Includes:</div>
                  <div className="flex flex-wrap gap-1">
                    {preset.collections.slice(0, 3).map((collection, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {collection.name}
                      </Badge>
                    ))}
                    {preset.collections.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{preset.collections.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Base: {preset.base_image.split('/').pop()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Preset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this preset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDeletePreset(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}