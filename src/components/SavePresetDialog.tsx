import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collection, AdditionalBuildStep } from '@/lib/storage';
import { userPresetsService } from '@/lib/userPresets';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SavePresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseImage: string;
  collections: Collection[];
  requirements: string[];
  packages: string[];
  additionalBuildSteps?: AdditionalBuildStep[];
  onSuccess?: () => void;
}

const PRESET_ICONS = ['⚙️', '🚀', '🌐', '☁️', '🐳', '🔒', '📦', '🛠️', '💻', '🎯'];

export const SavePresetDialog: React.FC<SavePresetDialogProps> = ({
  open,
  onOpenChange,
  baseImage,
  collections,
  requirements,
  packages,
  additionalBuildSteps,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('⚙️');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your preset.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await userPresetsService.createUserPreset({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
        base_image: baseImage,
        collections,
        requirements,
        packages,
        additional_build_steps: additionalBuildSteps || [],
      });

      toast({
        title: 'Preset saved!',
        description: `"${name}" has been saved to your templates.`,
      });

      // Reset form
      setName('');
      setDescription('');
      setSelectedIcon('⚙️');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving preset:', error);
      toast({
        title: 'Failed to save preset',
        description: 'There was an error saving your preset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Preset</DialogTitle>
          <DialogDescription>
            Save your current configuration as a reusable preset template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Preset"
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of this preset..."
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  disabled={isLoading}
                  className={`w-10 h-10 rounded-md border text-lg hover:bg-accent transition-colors ${
                    selectedIcon === icon ? 'border-primary bg-accent' : 'border-input'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};