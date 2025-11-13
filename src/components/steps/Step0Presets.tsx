import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PRESETS } from "@/lib/presets";

interface Step0PresetsProps {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

export function Step0Presets({ selectedPreset, onPresetChange }: Step0PresetsProps) {
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
              <Badge variant="secondary" className="text-xs">Custom</Badge>
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
              <CardDescription>
                {preset.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium mb-1">Includes:</div>
                  <div className="text-sm text-muted-foreground">
                    {preset.collections.length} collections, {preset.requirements.length} requirements, {preset.packages.length} packages
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Base: {preset.baseImage}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
