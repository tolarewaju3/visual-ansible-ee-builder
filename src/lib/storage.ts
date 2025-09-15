export interface Collection {
  name: string;
  version?: string;
}

export interface BuilderState {
  currentStep: number;
  selectedPreset: string;
  selectedBaseImage: string;
  selectedCollections: Collection[];
  requirements: string[];
  selectedPackages: string[];
}

export const STORAGE_KEY = 'ansible-builder-state';

export const DEFAULT_STATE: BuilderState = {
  currentStep: 0,
  selectedPreset: '',
  selectedBaseImage: "registry.access.redhat.com/ubi9/python-311:latest",
  selectedCollections: [],
  requirements: [],
  selectedPackages: []
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