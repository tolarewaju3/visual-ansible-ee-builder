import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { StepNavigation } from "@/components/StepNavigation";
import { Step0Presets } from "@/components/steps/Step0Presets";
import { Step1BaseImage } from "@/components/steps/Step1BaseImage";
import { Step2CollectionsRequirements } from "@/components/steps/Step2CollectionsRequirements";
import { Step3Customize } from "@/components/steps/Step3Customize";
import { Step4Review } from "@/components/steps/Step4Review";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BuilderState, DEFAULT_STATE, STORAGE_KEY } from "@/lib/storage";
import { Settings, Container, Package, FileCode, CheckCircle } from "lucide-react";
import { PRESETS } from "@/lib/presets";

export default function Builder() {
  const [state, setState] = useLocalStorage<BuilderState>(STORAGE_KEY, DEFAULT_STATE);
  const [currentStep, setCurrentStep] = useState(state.currentStep);

  useEffect(() => {
    setState({ ...state, currentStep });
  }, [currentStep]);

  const handlePresetChange = (presetId: string) => {
    setState({ ...state, selectedPreset: presetId });
    
    // Apply preset if it's not scratch
    if (presetId !== 'scratch') {
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) {
        setState({
          ...state,
          selectedPreset: presetId,
          selectedBaseImage: preset.baseImage,
          selectedCollections: preset.collections,
          requirements: preset.requirements || [],
          selectedPackages: preset.packages || [],
          additionalBuildSteps: preset.additionalBuildSteps || [],
        });
      }
    }
  };

  const handleBaseImageChange = (baseImage: string) => {
    setState({ ...state, selectedBaseImage: baseImage });
  };

  const handleCollectionsChange = (collections: { name: string; version?: string }[]) => {
    setState({ ...state, selectedCollections: collections });
  };

  const handleRequirementsChange = (requirements: string[]) => {
    setState({ ...state, requirements });
  };

  const handlePackagesChange = (packages: string[]) => {
    setState({ ...state, selectedPackages: packages });
  };

  const handleAdditionalBuildStepsChange = (steps: any[]) => {
    setState({ ...state, additionalBuildSteps: steps });
  };

  const handleRedhatCredentialsChange = (credentials: { username: string; password: string } | undefined) => {
    setState({ ...state, redhatCredentials: credentials });
  };

  const handleRegistryCredentialsChange = (credentials: { username: string; password: string } | undefined) => {
    setState({ ...state, registryCredentials: credentials });
  };

  const steps = [
    { id: 0, title: "Presets", icon: Settings },
    { id: 1, title: "Base Image", icon: Container },
    { id: 2, title: "Collections", icon: Package },
    { id: 3, title: "Customize", icon: FileCode },
    { id: 4, title: "Review", icon: CheckCircle },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-bold">Ansible Builder</h1>
        <p className="text-muted-foreground">
          Build custom Ansible Execution Environments
        </p>
      </div>

      <Card className="p-6">
        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canGoNext={currentStep < steps.length - 1}
          canGoPrev={currentStep > 0}
          onNext={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
          onPrev={() => setCurrentStep(Math.max(currentStep - 1, 0))}
        />

        <div className="mt-8">
          {currentStep === 0 && (
            <Step0Presets
              selectedPreset={state.selectedPreset}
              onPresetChange={handlePresetChange}
            />
          )}

          {currentStep === 1 && (
            <Step1BaseImage
              selectedBaseImage={state.selectedBaseImage}
              onBaseImageChange={handleBaseImageChange}
              redhatCredentials={state.redhatCredentials}
              onRedhatCredentialsChange={handleRedhatCredentialsChange}
            />
          )}

          {currentStep === 2 && (
            <Step2CollectionsRequirements
              selectedCollections={state.selectedCollections}
              onCollectionsChange={handleCollectionsChange}
              requirements={state.requirements}
              onRequirementsChange={handleRequirementsChange}
              selectedPackages={state.selectedPackages}
              onPackagesChange={handlePackagesChange}
            />
          )}

          {currentStep === 3 && (
            <Step3Customize
              additionalBuildSteps={state.additionalBuildSteps}
              onAdditionalBuildStepsChange={handleAdditionalBuildStepsChange}
            />
          )}

          {currentStep === 4 && (
            <Step4Review
              selectedBaseImage={state.selectedBaseImage}
              selectedCollections={state.selectedCollections}
              requirements={state.requirements}
              selectedPackages={state.selectedPackages}
              additionalBuildSteps={state.additionalBuildSteps}
              redhatCredentials={state.redhatCredentials}
              registryCredentials={state.registryCredentials}
              onRegistryCredentialsChange={handleRegistryCredentialsChange}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
