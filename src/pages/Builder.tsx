// Ansible Execution Environment Builder
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Container, Layers, Package, Play, ChevronLeft, ChevronRight, RotateCcw, Sparkles, Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "@/components/StepNavigation";
import { Step0Presets } from "@/components/steps/Step0Presets";
import { Step1BaseImage } from "@/components/steps/Step1BaseImage";
import { Step2CollectionsRequirements } from "@/components/steps/Step2CollectionsRequirements";
import { Step3Customize } from "@/components/steps/Step3Customize";
import { Step4Review } from "@/components/steps/Step4Review";
import { SavePresetDialog } from "@/components/SavePresetDialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Collection, AdditionalBuildStep, RedHatCredentials, STORAGE_KEY, DEFAULT_STATE, clearStoredState } from "@/lib/storage";
import { getPresetById } from "@/lib/presets";

const steps = [
  {
    id: 0,
    title: "Presests",
    icon: Sparkles,
  },
  {
    id: 1,
    title: "Base Image",
    icon: Container,
  },
  {
    id: 2,
    title: "Requirements",
    icon: Layers,
  },
  {
    id: 3,
    title: "Customization",
    icon: Settings,
  },
  {
    id: 4,
    title: "Build EE",
    icon: Play,
  },
];

const Builder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Persistent state using localStorage
  const [currentStep, setCurrentStep] = useLocalStorage(`${STORAGE_KEY}-currentStep`, DEFAULT_STATE.currentStep);
  const [selectedPreset, setSelectedPreset] = useLocalStorage(`${STORAGE_KEY}-selectedPreset`, DEFAULT_STATE.selectedPreset);
  const [selectedBaseImage, setSelectedBaseImage] = useLocalStorage(`${STORAGE_KEY}-selectedBaseImage`, DEFAULT_STATE.selectedBaseImage);
  const [selectedCollections, setSelectedCollections] = useLocalStorage<Collection[]>(`${STORAGE_KEY}-selectedCollections`, DEFAULT_STATE.selectedCollections);
  const [requirements, setRequirements] = useLocalStorage<string[]>(`${STORAGE_KEY}-requirements`, DEFAULT_STATE.requirements);
  const [selectedPackages, setSelectedPackages] = useLocalStorage<string[]>(`${STORAGE_KEY}-selectedPackages`, DEFAULT_STATE.selectedPackages);
  const [additionalBuildSteps, setAdditionalBuildSteps] = useLocalStorage<AdditionalBuildStep[]>(`${STORAGE_KEY}-additionalBuildSteps`, DEFAULT_STATE.additionalBuildSteps);
  const [redhatCredentials, setRedhatCredentials] = useLocalStorage<RedHatCredentials | undefined>(`${STORAGE_KEY}-redhatCredentials`, DEFAULT_STATE.redhatCredentials);

  // Handle preset from Templates page
  useEffect(() => {
    const state = location.state as any;
    if (state?.usePreset) {
      const preset = state.usePreset;
      setSelectedPreset(preset.id);
      setSelectedBaseImage(preset.baseImage);
      setSelectedCollections(preset.collections);
      setRequirements(preset.requirements);
      setSelectedPackages(preset.packages);
      setAdditionalBuildSteps(preset.additionalBuildSteps || []);
      setRedhatCredentials(undefined); // Clear credentials on preset change
      
      // Clear the state to prevent reapplying on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const applyPreset = (presetId: string) => {
    if (presetId === 'scratch') {
      // Reset to default values for scratch
      setSelectedBaseImage(DEFAULT_STATE.selectedBaseImage);
      setSelectedCollections(DEFAULT_STATE.selectedCollections);
      setRequirements(DEFAULT_STATE.requirements);
      setSelectedPackages(DEFAULT_STATE.selectedPackages);
      setAdditionalBuildSteps(DEFAULT_STATE.additionalBuildSteps);
      setRedhatCredentials(DEFAULT_STATE.redhatCredentials);
    } else if (presetId.startsWith('user_')) {
      // Handle user preset - data should already be loaded from useEffect
      // No need to do anything here as the data is already set
    } else {
      // Handle built-in preset
      const preset = getPresetById(presetId);
      if (preset) {
        setSelectedBaseImage(preset.baseImage);
        setSelectedCollections(preset.collections);
        setRequirements(preset.requirements);
        setSelectedPackages(preset.packages);
        setAdditionalBuildSteps(preset.additionalBuildSteps || []);
        setRedhatCredentials(undefined); // Clear credentials on preset change
      }
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    applyPreset(presetId);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        // Can proceed if a preset is selected
        return selectedPreset.trim() !== "";
      case 1:
        // Can proceed if base image is selected and Red Hat credentials if needed
        if (selectedBaseImage.trim() === "") return false;
        if (selectedBaseImage.includes('registry.redhat.io/ansible-automation-platform-25/ee-minimal-rhel9')) {
          return Boolean(redhatCredentials?.username && redhatCredentials?.password);
        }
        return true;
      case 2:
        // Check if Red Hat credentials are needed and provided
        const needsRedHatCreds = 
          selectedBaseImage.includes('registry.redhat.io/ansible-automation-platform-25/ee-minimal-rhel9') ||
          selectedPackages.some(pkg => ['telnet', 'tcpdump', 'openshift'].includes(pkg.toLowerCase())) ||
          requirements.some(req => req.toLowerCase().includes('openshift'));
        
        if (needsRedHatCreds) {
          return Boolean(redhatCredentials?.username && redhatCredentials?.password);
        }
        return true;
      case 3:
        // Can always proceed from step 3, even with no additional build steps
        return true;
      case 4:
        // Final step, show save preset button
        return true;
      default:
        return false;
    }
  };

  const canGoPrev = () => {
    return currentStep > 0;
  };

  const handleNext = () => {
    if (currentStep === 4) {
      // On final step, check auth before saving preset
      if (!user) {
        navigate('/auth');
        return;
      }
      handleSavePreset();
    } else if (canGoNext() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleSavePreset = () => {
    setShowSaveDialog(true);
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    // Clear localStorage
    clearStoredState();
    
    // Reset all state to defaults
    setCurrentStep(DEFAULT_STATE.currentStep);
    setSelectedPreset(DEFAULT_STATE.selectedPreset);
    setSelectedBaseImage(DEFAULT_STATE.selectedBaseImage);
    setSelectedCollections(DEFAULT_STATE.selectedCollections);
    setRequirements(DEFAULT_STATE.requirements);
    setSelectedPackages(DEFAULT_STATE.selectedPackages);
    setAdditionalBuildSteps(DEFAULT_STATE.additionalBuildSteps);
    setRedhatCredentials(DEFAULT_STATE.redhatCredentials);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step0Presets
            selectedPreset={selectedPreset}
            onPresetChange={handlePresetChange}
          />
        );
      case 1:
        return (
          <Step1BaseImage
            selectedBaseImage={selectedBaseImage}
            onBaseImageChange={setSelectedBaseImage}
            redhatCredentials={redhatCredentials}
            onRedhatCredentialsChange={setRedhatCredentials}
          />
        );
      case 2:
        return (
          <Step2CollectionsRequirements
            selectedCollections={selectedCollections}
            requirements={requirements}
            selectedPackages={selectedPackages}
            baseImage={selectedBaseImage}
            redhatCredentials={redhatCredentials}
            onCollectionsChange={setSelectedCollections}
            onRequirementsChange={setRequirements}
            onPackagesChange={setSelectedPackages}
            onRedhatCredentialsChange={setRedhatCredentials}
          />
        );
      case 3:
        return (
          <Step3Customize
            additionalBuildSteps={additionalBuildSteps}
            onAdditionalBuildStepsChange={setAdditionalBuildSteps}
          />
        );
      case 4:
        return (
          <Step4Review
            selectedBaseImage={selectedBaseImage}
            selectedCollections={selectedCollections}
            requirements={requirements}
            selectedPackages={selectedPackages}
            additionalBuildSteps={additionalBuildSteps}
            redhatCredentials={redhatCredentials}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <StepNavigation
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canGoNext={canGoNext()}
          canGoPrev={canGoPrev()}
          onNext={handleNext}
          onPrev={handlePrev}
        />
        
        <main className="mt-8">
          {renderStep()}
        </main>
        
        {/* Navigation buttons at bottom */}
        <div className="border-t border-border bg-card mt-8">
          <div className="py-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={!canGoPrev()}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                className="flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </Button>

              {currentStep < steps.length && (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="flex items-center space-x-2"
                >
                  {currentStep === 4 ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{user ? "Save as Preset" : "Sign in to save preset"}</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Save Preset Dialog */}
        <SavePresetDialog 
          open={showSaveDialog} 
          onOpenChange={setShowSaveDialog}
          baseImage={selectedBaseImage}
          collections={selectedCollections}
          requirements={requirements}
          packages={selectedPackages}
          additionalBuildSteps={additionalBuildSteps}
          onSuccess={() => {
            // Optional: Add any additional success handling
          }}
        />
      </div>
    </div>
  );
};

export default Builder;