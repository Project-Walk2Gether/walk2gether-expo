import React, { createContext, useContext, useState } from "react";
import { Walk } from "walk2gether-shared";

export type WalkFormData = Partial<Walk>;

interface WalkFormContextType {
  formData: WalkFormData;
  updateFormData: (newData: Partial<Walk>) => void;
  setFormData: React.Dispatch<React.SetStateAction<WalkFormData>>;
  resetForm: () => void;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  totalSteps: number;
}

// Generate a random 6-character alphanumeric invitation code
const generateInvitationCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
};

const initialFormData: WalkFormContextType["formData"] = {
  durationMinutes: 30, // Default duration in minutes
  invitationCode: generateInvitationCode(),
};

const WalkFormContext = createContext<WalkFormContextType | undefined>(
  undefined
);

export interface Props {
  children: React.ReactNode;
}

export const WalkFormProvider: React.FC<Props> = ({ children }) => {
  // Initialize form with a fresh invitation code on each form creation
  const initializedFormData = {
    ...initialFormData,
    invitationCode: generateInvitationCode(),
  };
  const [formData, setFormData] = useState<WalkFormData>(initializedFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6; // Type selection + 4 wizard steps

  const updateFormData = (newData: Partial<WalkFormData>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const resetForm = () => {
    // Generate a new invitation code when resetting the form
    setFormData({
      ...initialFormData,
      invitationCode: generateInvitationCode(),
    });
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

  // Location handling is now managed by LocationContext

  return (
    <WalkFormContext.Provider
      value={{
        formData,
        updateFormData,
        setFormData,
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

// Higher-Order Component (HOC) that wraps a component with the WalkFormProvider
export const WithWalkFormProvider = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & Partial<Props>> => {
  return (props) => {
    const { ...componentProps } = props;

    return (
      <WalkFormProvider>
        <Component {...(componentProps as P)} />
      </WalkFormProvider>
    );
  };
};
