import { useState } from "react";
import { Layers, Package, Play } from "lucide-react";
import { StepNavigation } from "@/components/StepNavigation";
import { Step1CollectionsRequirements } from "@/components/steps/Step1CollectionsRequirements";
import { Step2Packages } from "@/components/steps/Step2Packages";
import { Step3Build } from "@/components/steps/Step3Build";

interface Collection {
  name: string;
  version?: string;
}

const steps = [
  {
    id: 1,
    title: "Collections & Requirements",
    description: "Ansible collections and Python dependencies",
    icon: Layers,
  },
  {
    id: 2,
    title: "System Packages",
    description: "Operating system packages and utilities",
    icon: Package,
  },
  {
    id: 3,
    title: "Build & Deploy",
    description: "Configure and build your execution environment",
    icon: Play,
  },
];

const Builder = () => {
  const [currentStep, setCurrentStep] = useState(1);
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
        // Can always proceed from step 1, even with empty selections
        return true;
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
          <Step1CollectionsRequirements
            selectedCollections={selectedCollections}
            requirements={requirements}
            onCollectionsChange={setSelectedCollections}
            onRequirementsChange={setRequirements}
          />
        );
      case 2:
        return (
          <Step2Packages
            selectedPackages={selectedPackages}
            onPackagesChange={setSelectedPackages}
          />
        );
      case 3:
        return (
          <Step3Build
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
    </div>
  );
};

export default Builder;