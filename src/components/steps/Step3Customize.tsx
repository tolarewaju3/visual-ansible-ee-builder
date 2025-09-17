import { useState } from "react";
import { Plus, Trash2, GripVertical, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AdditionalBuildStep } from "@/lib/storage";

interface Step3CustomizeProps {
  additionalBuildSteps: AdditionalBuildStep[];
  onAdditionalBuildStepsChange: (steps: AdditionalBuildStep[]) => void;
}

const STEP_TYPE_OPTIONS = [
  { value: 'prepend_base', label: 'Prepend Base - Before base image dependencies' },
  { value: 'append_base', label: 'Append Base - After base image dependencies' },
  { value: 'prepend_galaxy', label: 'Prepend Galaxy - Before Ansible collections' },
  { value: 'append_galaxy', label: 'Append Galaxy - After Ansible collections' },
  { value: 'prepend_builder', label: 'Prepend Builder - Before main build steps' },
  { value: 'append_builder', label: 'Append Builder - After main build steps' },
  { value: 'prepend_final', label: 'Prepend Final - Before final image steps' },
  { value: 'append_final', label: 'Append Final - After final image steps' },
];

export function Step3Customize({ additionalBuildSteps, onAdditionalBuildStepsChange }: Step3CustomizeProps) {
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set());

  const generateId = () => `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addBuildStep = () => {
    const newStep: AdditionalBuildStep = {
      id: generateId(),
      stepType: 'prepend_base',
      commands: []
    };
    onAdditionalBuildStepsChange([...additionalBuildSteps, newStep]);
    setOpenSteps(prev => new Set([...prev, newStep.id]));
  };

  const removeBuildStep = (id: string) => {
    onAdditionalBuildStepsChange(additionalBuildSteps.filter(step => step.id !== id));
    setOpenSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const updateBuildStep = (id: string, field: keyof AdditionalBuildStep, value: any) => {
    onAdditionalBuildStepsChange(
      additionalBuildSteps.map(step =>
        step.id === id ? { ...step, [field]: value } : step
      )
    );
  };

  const updateCommands = (id: string, commandsText: string) => {
    const commands = commandsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    updateBuildStep(id, 'commands', commands);
  };

  const moveStepUp = (index: number) => {
    if (index > 0) {
      const newSteps = [...additionalBuildSteps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      onAdditionalBuildStepsChange(newSteps);
    }
  };

  const moveStepDown = (index: number) => {
    if (index < additionalBuildSteps.length - 1) {
      const newSteps = [...additionalBuildSteps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      onAdditionalBuildStepsChange(newSteps);
    }
  };

  const toggleStepOpen = (id: string) => {
    setOpenSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Additional Build Steps</span>
          </CardTitle>
          <CardDescription>
            Add custom build steps that will be executed at specific points during the execution environment build process. These map to Ansible Builder's additional_build_steps configuration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {additionalBuildSteps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No additional build steps defined</p>
              <p className="text-sm mb-4">
                Add custom build steps to customize your execution environment build process
              </p>
              <Button onClick={addBuildStep} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Build Step</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {additionalBuildSteps.map((step, index) => (
                <Card key={step.id} className="bg-muted/30 border-border">
                  <Collapsible
                    open={openSteps.has(step.id)}
                    onOpenChange={() => toggleStepOpen(step.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              Build Step {index + 1}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {STEP_TYPE_OPTIONS.find(opt => opt.value === step.stepType)?.label || step.stepType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStepUp(index);
                            }}
                            disabled={index === 0}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStepDown(index);
                            }}
                            disabled={index === additionalBuildSteps.length - 1}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBuildStep(step.id);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4 border-t border-border/50">
                        <div className="pt-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Step Type</Label>
                            <Select
                              value={step.stepType}
                              onValueChange={(value) => updateBuildStep(step.id, 'stepType', value)}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-background border-border shadow-lg z-50">
                                {STEP_TYPE_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Commands</Label>
                            <Textarea
                              placeholder="Enter commands (one per line)&#10;RUN apt-get update&#10;RUN apt-get install -y curl&#10;COPY custom-script.sh /usr/local/bin/"
                              value={step.commands.join('\n')}
                              onChange={(e) => updateCommands(step.id, e.target.value)}
                              rows={6}
                              className="font-mono text-sm bg-background"
                            />
                            <p className="text-xs text-muted-foreground">
                              Each line will be treated as a separate command. Empty lines will be ignored.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
              
              <Button onClick={addBuildStep} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Build Step
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}