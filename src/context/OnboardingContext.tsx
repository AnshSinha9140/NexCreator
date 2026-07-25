"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  OnboardingState,
  CreatorProfileData,
  PlatformSelectionData,
  ConnectedPlatformsData,
  CreatorGoalsData,
} from "@/types";

export interface StepMetadata {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  isSkippable?: boolean;
}

export const ONBOARDING_STEPS: StepMetadata[] = [
  {
    id: "welcome",
    number: 1,
    title: "Welcome to NexCreator",
    subtitle: "Fastest Path to Stream Intelligence",
    description: "Set up your creator workspace in under 60 seconds to unlock real-time live stream analysis and AI producer guidance.",
    isSkippable: false,
  },
  {
    id: "profile",
    number: 2,
    title: "Creator Profile",
    subtitle: "Your Identity",
    description: "Enter your display name and optional profile avatar.",
    isSkippable: false,
  },
  {
    id: "platform_selection",
    number: 3,
    title: "Platform Selection",
    subtitle: "Choose Streaming Channels",
    description: "Select the platforms you broadcast or publish content on.",
    isSkippable: false,
  },
  {
    id: "platform_connection",
    number: 4,
    title: "Platform Connection",
    subtitle: "Link Your Streams",
    description: "Paste your channel URLs to enable real-time chat monitoring and AI sentiment analysis.",
    isSkippable: true,
  },
  {
    id: "goals",
    number: 5,
    title: "Creator Goals",
    subtitle: "What Matters Most",
    description: "Choose your primary objectives so your AI Producer tailors stream recommendations.",
    isSkippable: true,
  },
  {
    id: "finish",
    number: 6,
    title: "Ready to Launch!",
    subtitle: "Setup Complete",
    description: "Your Creator Intelligence Engine is configured and ready.",
    isSkippable: false,
  },
];

const INITIAL_ONBOARDING_STATE: OnboardingState = {
  currentStepIndex: 0,
  creatorProfile: {
    displayName: "",
    avatarUrl: "",
  },
  platformSelection: {
    selectedPlatforms: ["kick", "youtube"],
  },
  connectedPlatforms: {
    kickUrl: "",
    youtubeUrl: "",
  },
  goals: {
    goals: ["Grow Viewers", "Improve Engagement", "Find Viral Clips"],
  },
  isStepValid: [true, false, true, true, true, true],
};

const STORAGE_KEY = "nexcreator_onboarding_state_v2";

interface OnboardingContextType {
  state: OnboardingState;
  currentStep: StepMetadata;
  totalSteps: number;
  progressPercentage: number;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (index: number) => void;
  updateProfile: (data: Partial<CreatorProfileData>) => void;
  updatePlatformSelection: (data: Partial<PlatformSelectionData>) => void;
  updateConnectedPlatforms: (data: Partial<ConnectedPlatformsData>) => void;
  updateGoals: (data: Partial<CreatorGoalsData>) => void;
  setStepValidity: (index: number, isValid: boolean) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(INITIAL_ONBOARDING_STATE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch (e) {
      console.warn("Failed to load onboarding persistence:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("Failed to save onboarding persistence:", e);
      }
    }
  }, [state, isHydrated]);

  const currentStep = ONBOARDING_STEPS[state.currentStepIndex] || ONBOARDING_STEPS[0];
  const totalSteps = ONBOARDING_STEPS.length;
  const progressPercentage = Math.round(((state.currentStepIndex + 1) / totalSteps) * 100);

  const goToNextStep = () => {
    if (state.currentStepIndex < totalSteps - 1) {
      setState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      }));
    }
  };

  const goToPrevStep = () => {
    if (state.currentStepIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex - 1,
      }));
    }
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      for (let i = 0; i < index; i++) {
        if (!state.isStepValid[i] && !ONBOARDING_STEPS[i].isSkippable) {
          return;
        }
      }
      setState((prev) => ({ ...prev, currentStepIndex: index }));
    }
  };

  const updateProfile = (data: Partial<CreatorProfileData>) => {
    setState((prev) => {
      const newProfile = { ...prev.creatorProfile, ...data };
      const isValid = Boolean(newProfile.displayName.trim());
      const newValidity = [...prev.isStepValid];
      newValidity[1] = isValid;

      return {
        ...prev,
        creatorProfile: newProfile,
        isStepValid: newValidity,
      };
    });
  };

  const updatePlatformSelection = (data: Partial<PlatformSelectionData>) => {
    setState((prev) => ({
      ...prev,
      platformSelection: { ...prev.platformSelection, ...data },
    }));
  };

  const updateConnectedPlatforms = (data: Partial<ConnectedPlatformsData>) => {
    setState((prev) => ({
      ...prev,
      connectedPlatforms: { ...prev.connectedPlatforms, ...data },
    }));
  };

  const updateGoals = (data: Partial<CreatorGoalsData>) => {
    setState((prev) => ({
      ...prev,
      goals: { ...prev.goals, ...data },
    }));
  };

  const setStepValidity = (index: number, isValid: boolean) => {
    setState((prev) => {
      const newValidity = [...prev.isStepValid];
      newValidity[index] = isValid;
      return { ...prev, isStepValid: newValidity };
    });
  };

  const resetOnboarding = () => {
    setState(INITIAL_ONBOARDING_STATE);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        currentStep,
        totalSteps,
        progressPercentage,
        goToNextStep,
        goToPrevStep,
        goToStep,
        updateProfile,
        updatePlatformSelection,
        updateConnectedPlatforms,
        updateGoals,
        setStepValidity,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
