// Ansible Execution Environment Builder
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Layers, Package, Play, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "@/components/StepNavigation";
import { Step0Presets } from "@/components/steps/Step0Presets";
import { Step1BaseImage } from "@/components/steps/Step1BaseImage";
import { Step2CollectionsRequirements } from "@/components/steps/Step2CollectionsRequirements";
import { Step3Review } from "@/components/steps/Step3Review";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Collection, STORAGE_KEY, DEFAULT_STATE, clearStoredState } from "@/lib/storage";
import { getPresetById } from "@/lib/presets";

const steps = [
  {
    id: 0,
    title: "Choose Preset",
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
    title: "Build Execution Environment",
    icon: Play,
  },
];

const Builder = () => {
  const location = useLocation();
  
  // Persistent state using localStorage
  const [currentStep, setCurrentStep] = useLocalStorage(`${STORAGE_KEY}-currentStep`, DEFAULT_STATE.currentStep);
  const [selectedPreset, setSelectedPreset] = useLocalStorage(`${STORAGE_KEY}-selectedPreset`, DEFAULT_STATE.selectedPreset);
  const [selectedBaseImage, setSelectedBaseImage] = useLocalStorage(`${STORAGE_KEY}-selectedBaseImage`, DEFAULT_STATE.selectedBaseImage);
  const [selectedCollections, setSelectedCollections] = useLocalStorage<Collection[]>(`${STORAGE_KEY}-selectedCollections`, DEFAULT_STATE.selectedCollections);
  const [requirements, setRequirements] = useLocalStorage<string[]>(`${STORAGE_KEY}-requirements`, DEFAULT_STATE.requirements);
  const [selectedPackages, setSelectedPackages] = useLocalStorage<string[]>(`${STORAGE_KEY}-selectedPackages`, DEFAULT_STATE.selectedPackages);

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
        // Can proceed if base image is selected
        return selectedBaseImage.trim() !== "";
      case 2:
        // Can always proceed from step 2, even with empty selections
        return true;
      case 3:
        // Final step, no next
        return false;
      default:
        return false;
    }
  };

  const canGoPrev = () => {
    return currentStep > 0;
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
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
          />
        );
      case 2:
        return (
          <Step2CollectionsRequirements
            selectedCollections={selectedCollections}
            requirements={requirements}
            selectedPackages={selectedPackages}
            baseImage={selectedBaseImage}
            onCollectionsChange={setSelectedCollections}
            onRequirementsChange={setRequirements}
            onPackagesChange={setSelectedPackages}
          />
        );
      case 3:
        return (
          <Step3Review
            selectedBaseImage={selectedBaseImage}
            selectedCollections={selectedCollections}
            requirements={requirements}
            selectedPackages={selectedPackages}
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
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;