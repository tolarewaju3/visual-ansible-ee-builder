import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRESETS, Preset } from "@/lib/presets";
import { Wrench } from "lucide-react";

interface Step0PresetsProps {
  selectedPreset: string;
  onPresetChange: (presetId: string) => void;
}

export function Step0Presets({ selectedPreset, onPresetChange }: Step0PresetsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choose Your Starting Point</h2>
        <p className="text-muted-foreground text-lg">
          Select a preset to get started quickly, or build from scratch
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Start from scratch option */}
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedPreset === 'scratch' ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onPresetChange('scratch')}
        >
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🛠️</div>
            <CardTitle className="text-xl">Start from Scratch</CardTitle>
            <CardDescription>
              Build your execution environment from the ground up with full control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="text-sm">Full customization</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Perfect for specific requirements or learning
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preset options */}
        {PRESETS.map((preset) => (
          <Card 
            key={preset.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedPreset === preset.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPresetChange(preset.id)}
          >
            <CardHeader className="text-center">
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
      </div>

    </div>
  );
}