// Ansible Execution Environment Builder
import { useState } from "react";
import { Container, Layers, Package, Play, ChevronLeft, ChevronRight, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "@/components/StepNavigation";
import { Step1BaseImage } from "@/components/steps/Step1BaseImage";
import { Step2CollectionsRequirements } from "@/components/steps/Step2CollectionsRequirements";
import { Step3Review } from "@/components/steps/Step3Review";
import { Step4Build } from "@/components/steps/Step4Build";

interface Collection {
  name: string;
  version?: string;
}

const steps = [
  {
    id: 1,
    title: "Base Image",
    description: "Select container base image",
    icon: Container,
  },
  {
    id: 2,
    title: "Requirements",
    description: "Ansible collections, Python dependencies, and system packages",
    icon: Layers,
  },
  {
    id: 3,
    title: "Review",
    description: "Review configuration and generated files",
    icon: Eye,
  },
  {
    id: 4,
    title: "Build & Deploy",
    description: "Build and deploy your execution environment",
    icon: Play,
  },
];

const Builder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBaseImage, setSelectedBaseImage] = useState("registry.access.redhat.com/ubi9/python-311:latest");
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  
  // Build state
  const [imageName, setImageName] = useState("my-ansible-ee");
  const [imageTag, setImageTag] = useState("latest");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [buildLogs, setBuildLogs] = useState("");

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        // Can proceed if base image is selected
        return selectedBaseImage.trim() !== "";
      case 2:
        // Can always proceed from step 2, even with empty selections
        return true;
      case 3:
        // Can always proceed from review step
        return true;
      case 4:
        // Final step, no next
        return false;
      default:
        return false;
    }
  };

  const canGoPrev = () => {
    return currentStep > 1;
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < steps.length) {
      // If on step 3 (Review), start the build when proceeding
      if (currentStep === 3) {
        startBuild();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    // Reset all state to defaults
    setSelectedBaseImage("registry.access.redhat.com/ubi9/python-311:latest");
    setSelectedCollections([]);
    setRequirements([]);
    setSelectedPackages([]);
    setImageName("my-ansible-ee");
    setImageTag("latest");
    setIsBuilding(false);
    setBuildProgress(0);
    setBuildStatus('idle');
    setBuildLogs("");
    setCurrentStep(1);
  };

  const startBuild = () => {
    setIsBuilding(true);
    setBuildStatus('building');
    setBuildProgress(0);
    setBuildLogs("Starting build process...\n");

    // Simulate build process
    const steps = [
      "Setting up build environment...",
      "Installing collections...",
      "Installing Python requirements...",
      "Installing system packages...",
      "Building container image...",
      "Pushing to registry..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setBuildProgress((currentStep / steps.length) * 100);
      setBuildLogs(prev => prev + `${steps[currentStep - 1]}\n`);

      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsBuilding(false);
        setBuildStatus('success');
        setBuildLogs(prev => prev + "Build completed successfully!\n");
      }
    }, 1500);
  };

  const renderStep = () => {
    switch (currentStep) {
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
            imageName={imageName}
            imageTag={imageTag}
            onImageNameChange={setImageName}
            onImageTagChange={setImageTag}
            isBuilding={isBuilding}
          />
        );
      case 4:
        return (
          <Step4Build
            buildProgress={buildProgress}
            buildStatus={buildStatus}
            buildLogs={buildLogs}
            isBuilding={isBuilding}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <StepNavigation
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        canGoNext={canGoNext()}
        canGoPrev={canGoPrev()}
        onNext={handleNext}
        onPrev={handlePrev}
      />
      
      <main className="container mx-auto px-6 py-8">
        {renderStep()}
      </main>
      
      {/* Navigation buttons at bottom */}
      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-6 py-4">
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
                <span>{currentStep === 3 ? "Start Build" : "Next"}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;