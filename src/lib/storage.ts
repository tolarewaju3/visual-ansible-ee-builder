export interface Collection {
  name: string;
  version?: string;
}

export interface AdditionalBuildStep {
  id: string;
  stepType: 'prepend_base' | 'append_base' | 'prepend_galaxy' | 'append_galaxy' | 'prepend_builder' | 'append_builder' | 'prepend_final' | 'append_final';
  commands: string[];
}

export interface RedHatCredentials {
  username: string;
  password: string;
}

export interface BuilderState {
  currentStep: number;
  selectedPreset: string;
  selectedBaseImage: string;
  selectedCollections: Collection[];
  requirements: string[];
  selectedPackages: string[];
  additionalBuildSteps: AdditionalBuildStep[];
  redhatCredentials?: RedHatCredentials;
}

export const STORAGE_KEY = 'ansible-builder-state';

export const DEFAULT_STATE: BuilderState = {
  currentStep: 0,
  selectedPreset: '',
  selectedBaseImage: "registry.access.redhat.com/ubi9/python-311:latest",
  selectedCollections: [],
  requirements: [],
  selectedPackages: [],
  additionalBuildSteps: [],
  redhatCredentials: undefined
};

export const clearStoredState = () => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Error clearing stored state:', error);
  }
};