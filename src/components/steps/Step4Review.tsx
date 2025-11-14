import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, FileCode, Lock } from "lucide-react";
import { Collection, AdditionalBuildStep } from "@/lib/storage";
import JSZip from "jszip";
import { toast } from "sonner";

interface Step4ReviewProps {
  selectedBaseImage: string;
  selectedCollections: Collection[];
  requirements: string[];
  selectedPackages: string[];
  additionalBuildSteps: AdditionalBuildStep[];
  redhatCredentials?: { username: string; password: string };
  registryCredentials?: { username: string; password: string };
  onRegistryCredentialsChange?: (credentials: { username: string; password: string } | undefined) => void;
}

export function Step4Review({
  selectedBaseImage,
  selectedCollections,
  requirements,
  selectedPackages,
  additionalBuildSteps,
  redhatCredentials,
  registryCredentials,
  onRegistryCredentialsChange,
}: Step4ReviewProps) {
  const [registryUsername, setRegistryUsername] = useState(registryCredentials?.username || "");
  const [registryPassword, setRegistryPassword] = useState(registryCredentials?.password || "");

  const generateExecutionEnvironment = () => {
    const config: any = {
      version: 3,
      images: {
        base_image: {
          name: selectedBaseImage,
        },
      },
    };

    if (selectedCollections.length > 0) {
      config.dependencies = {
        galaxy: "requirements.yml",
      };
    }

    if (requirements.length > 0) {
      config.dependencies = {
        ...config.dependencies,
        python: "requirements.txt",
      };
    }

    if (selectedPackages.length > 0) {
      config.dependencies = {
        ...config.dependencies,
        system: "bindep.txt",
      };
    }

    if (additionalBuildSteps.length > 0) {
      config.additional_build_steps = {};
      additionalBuildSteps.forEach((step) => {
        if (!config.additional_build_steps[step.stepType]) {
          config.additional_build_steps[step.stepType] = [];
        }
        config.additional_build_steps[step.stepType].push(...step.commands);
      });
    }

    return config;
  };

  const generateRequirementsYml = () => {
    if (selectedCollections.length === 0) return null;

    const collections = selectedCollections.map((col) => {
      if (col.version) {
        return `  - name: ${col.name}\n    version: "${col.version}"`;
      }
      return `  - ${col.name}`;
    });

    return `---\ncollections:\n${collections.join("\n")}`;
  };

  const generateRequirementsTxt = () => {
    if (requirements.length === 0) return null;
    return requirements.join("\n");
  };

  const generateBindepTxt = () => {
    if (selectedPackages.length === 0) return null;
    return selectedPackages.join("\n");
  };

  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      const eeConfig = generateExecutionEnvironment();
      
      zip.file("execution-environment.yml", `---\n${JSON.stringify(eeConfig, null, 2)}`);

      const requirementsYml = generateRequirementsYml();
      if (requirementsYml) {
        zip.file("requirements.yml", requirementsYml);
      }

      const requirementsTxt = generateRequirementsTxt();
      if (requirementsTxt) {
        zip.file("requirements.txt", requirementsTxt);
      }

      const bindepTxt = generateBindepTxt();
      if (bindepTxt) {
        zip.file("bindep.txt", bindepTxt);
      }

      if (redhatCredentials?.username && redhatCredentials?.password) {
        const authContent = `ANSIBLE_GALAXY_SERVER_AUTOMATION_HUB_URL=https://console.redhat.com/api/automation-hub/
ANSIBLE_GALAXY_SERVER_AUTOMATION_HUB_AUTH_URL=https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token
ANSIBLE_GALAXY_SERVER_AUTOMATION_HUB_TOKEN=${redhatCredentials.username}:${redhatCredentials.password}`;
        zip.file(".env", authContent);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ansible-builder-config.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Configuration downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download configuration");
    }
  };

  const handleUpdateCredentials = () => {
    if (registryUsername.trim() && registryPassword.trim()) {
      onRegistryCredentialsChange?.({
        username: registryUsername.trim(),
        password: registryPassword.trim(),
      });
      toast.success("Registry credentials saved!");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
          <CardDescription>Review your execution environment configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Base Image</Label>
            <code className="block mt-1 p-2 bg-muted rounded text-sm font-mono">
              {selectedBaseImage}
            </code>
          </div>

          {selectedCollections.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Ansible Collections ({selectedCollections.length})</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCollections.map((col, idx) => (
                  <Badge key={idx} variant="secondary">
                    {col.name}{col.version && `:${col.version}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {requirements.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Python Requirements ({requirements.length})</Label>
              <code className="block mt-1 p-2 bg-muted rounded text-sm font-mono whitespace-pre-wrap">
                {requirements.join("\n")}
              </code>
            </div>
          )}

          {selectedPackages.length > 0 && (
            <div>
              <Label className="text-sm font-medium">System Packages ({selectedPackages.length})</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedPackages.map((pkg) => (
                  <Badge key={pkg} variant="outline">
                    {pkg}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {additionalBuildSteps.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Additional Build Steps ({additionalBuildSteps.length})</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Custom build steps configured
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registry Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Container Registry Credentials (Optional)
          </CardTitle>
          <CardDescription>
            Add credentials if you need to push to a private registry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="registry-username">Registry Username</Label>
            <Input
              id="registry-username"
              placeholder="Username"
              value={registryUsername}
              onChange={(e) => setRegistryUsername(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="registry-password">Registry Password/Token</Label>
            <Input
              id="registry-password"
              type="password"
              placeholder="Password or token"
              value={registryPassword}
              onChange={(e) => setRegistryPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateCredentials} variant="outline" className="w-full">
            Save Credentials
          </Button>
        </CardContent>
      </Card>

      {/* Download Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Download Configuration
          </CardTitle>
          <CardDescription>
            Download all configuration files as a ZIP archive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownload} className="w-full" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download Configuration Files
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            The ZIP file will contain execution-environment.yml and all required dependency files.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
