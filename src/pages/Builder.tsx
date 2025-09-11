import { useState } from "react";
import { Container, Layers, Package, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "@/components/StepNavigation";
import { Step1BaseImage } from "@/components/steps/Step1BaseImage";
import { Step2CollectionsRequirements } from "@/components/steps/Step2CollectionsRequirements";
import { Step3Packages } from "@/components/steps/Step3Packages";
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
    title: "Collections & Requirements",
    description: "Ansible collections and Python dependencies",
    icon: Layers,
  },
  {
    id: 3,
    title: "System Packages",
    description: "Operating system packages and utilities",
    icon: Package,
  },
  {
    id: 4,
    title: "Build & Deploy",
    description: "Configure and build your execution environment",
    icon: Play,
  },
];

const Builder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBaseImage, setSelectedBaseImage] = useState("registry.redhat.io/ubi8/ubi:latest");
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([
    { name: "ansible.posix", version: "1.5.4" }
  ]);
  const [requirements, setRequirements] = useState<string[]>([
    "requests>=2.28.0",
    "pyyaml>=6.0"
  ]);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([
    "git",
    "curl",
    "openssh-client"
  ]);

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        // Can proceed if base image is selected
        return selectedBaseImage.trim() !== "";
      case 2:
        // Can always proceed from step 2, even with empty selections
        return true;
      case 3:
        // Can always proceed from step 3, even with empty selections
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
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev()) {
      setCurrentStep(currentStep - 1);
    }
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
            onCollectionsChange={setSelectedCollections}
            onRequirementsChange={setRequirements}
          />
        );
      case 3:
        return (
          <Step3Packages
            selectedPackages={selectedPackages}
            onPackagesChange={setSelectedPackages}
          />
        );
      case 4:
        return (
          <Step4Build
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
          <div className="flex justify-between">
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
              onClick={handleNext}
              disabled={!canGoNext()}
              className="flex items-center space-x-2"
            >
              <span>{currentStep === steps.length ? "Complete Build" : "Next"}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;