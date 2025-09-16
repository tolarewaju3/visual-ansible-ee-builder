import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { UserPreset, userPresetsService } from '@/lib/userPresets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SubscriptionBadge } from '@/components/SubscriptionBadge';
import { toast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit, Download, Plus, Crown, Lock } from 'lucide-react';
import { format } from 'date-fns';

const Templates = () => {
  const { user, loading: authLoading } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [presets, setPresets] = useState<UserPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

  const loadPresets = async () => {
    try {
      setLoading(true);
      const data = await userPresetsService.getUserPresets();
      setPresets(data);
    } catch (error) {
      console.error('Error loading presets:', error);
      toast({
        title: 'Failed to load presets',
        description: 'There was an error loading your presets.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await userPresetsService.deleteUserPreset(id);
      setPresets(presets.filter(p => p.id !== id));
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

  const handleUsePreset = (preset: UserPreset) => {
    // Navigate to builder with preset data
    navigate('/', { 
      state: { 
        usePreset: {
          id: `user_${preset.id}`,
          name: preset.name,
          description: preset.description || '',
          icon: preset.icon,
          baseImage: preset.base_image,
          collections: preset.collections,
          requirements: preset.requirements,
          packages: preset.packages
        }
      }
    });
  };

  const exportPreset = (preset: UserPreset) => {
    const exportData = {
      name: preset.name,
      description: preset.description,
      icon: preset.icon,
      baseImage: preset.base_image,
      collections: preset.collections,
      requirements: preset.requirements,
      packages: preset.packages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Preset exported',
      description: 'Your preset configuration has been downloaded.',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold">My Templates</h1>
                <p className="text-muted-foreground">
                  Manage your saved preset configurations
                </p>
              </div>
              <SubscriptionBadge />
            </div>
            <Button onClick={() => navigate('/')}>
              <Plus className="mr-2 h-4 w-4" />
              New Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {presets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building configurations and save them as reusable templates.
            </p>
            <Button onClick={() => navigate('/')}>
              Create Your First Template
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {presets.map((preset) => (
              <Card key={preset.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{preset.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{preset.name}</CardTitle>
                        <CardDescription className="text-sm">
                          Created {format(new Date(preset.created_at), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  {preset.description && (
                    <CardDescription>{preset.description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Collections:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
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

                    {preset.requirements.length > 0 && (
                      <div>
                        <span className="font-medium">Requirements:</span> {preset.requirements.length} items
                      </div>
                    )}

                    {preset.packages.length > 0 && (
                      <div>
                        <span className="font-medium">Packages:</span> {preset.packages.length} items
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleUsePreset(preset)}
                      className="flex-1"
                    >
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportPreset(preset)}
                      disabled={!isPro}
                    >
                      {isPro ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteId(preset.id)}
                      disabled={!isPro}
                    >
                      {isPro ? (
                        <Trash2 className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {!isPro && (
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-2">
                      <Crown className="w-3 h-3 text-amber-500" />
                      <span>Pro required for editing and downloading</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Templates;