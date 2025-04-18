import React, { createContext, useContext, useState } from "react";

export interface WalkFormData {
  walkType: "friends" | "meetup" | "neighborhood" | null;
  date: Date | null;
  time: Date | null;
  location: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
  } | null;
  duration: number | null;
  invitees: string[] | null; // Keeping for backward compatibility
  invitedUserIds: string[] | null; // Specific friends to invite
  invitedPhoneNumbers: string[] | null; // Phone numbers to send SMS invites
  isNeighborhoodWalk: boolean;
}

interface WalkFormContextType {
  formData: WalkFormData;
  updateFormData: (newData: Partial<WalkFormData>) => void;
  resetForm: () => void;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  totalSteps: number;
}

const initialFormData: WalkFormData = {
  walkType: null,
  date: null,
  time: null,
  location: null,
  duration: 30, // Default duration in minutes
  invitees: null, 
  invitedUserIds: null,
  invitedPhoneNumbers: null,
  isNeighborhoodWalk: false,
};

const WalkFormContext = createContext<WalkFormContextType | undefined>(
  undefined
);

export const WalkFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<WalkFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6; // Type selection + 4 wizard steps

  const updateFormData = (newData: Partial<WalkFormData>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  return (
    <WalkFormContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        currentStep,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        totalSteps,
      }}
    >
      {children}
    </WalkFormContext.Provider>
  );
};

export const useWalkForm = (): WalkFormContextType => {
  const context = useContext(WalkFormContext);
  if (!context) {
    throw new Error("useWalkForm must be used within a WalkFormProvider");
  }
  return context;
};
