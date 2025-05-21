import { Timestamp } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Walk } from "walk2gether-shared";

export type WalkFormData = Partial<Walk>;

// Define a type for form errors with the same shape as the form data
export type WalkFormErrors = {
  [K in keyof WalkFormData]?: string;
};

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
  errors: WalkFormErrors;
  validateForm: () => boolean;
  isValid: boolean;
  // System-level errors (e.g., API failures)
  systemErrors: string[];
  setSystemErrors: React.Dispatch<React.SetStateAction<string[]>>;
  // Track if a walk has been created already
  createdWalkId: string | null;
  setCreatedWalkId: React.Dispatch<React.SetStateAction<string | null>>;
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
    date: Timestamp.now(),
    invitationCode: generateInvitationCode(),
  };
  const [formData, setFormData] = useState<WalkFormData>(initializedFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<WalkFormErrors>({});
  const [isValid, setIsValid] = useState(true);
  // System-level errors (e.g., API failures)
  const [systemErrors, setSystemErrors] = useState<string[]>([]);
  // Track if a walk has been created already
  const [createdWalkId, setCreatedWalkId] = useState<string | null>(null);
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
    setCreatedWalkId(null); // Reset the created walk ID
  };

  // Get the router for navigation
  const router = useRouter();

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      // If there's a next step, go to it
      setCurrentStep(currentStep + 1);
    } else {
      // If we're on the last step, close the wizard by navigating back
      router.back();
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

  // Form validation logic
  const validateForm = (): boolean => {
    const newErrors: WalkFormErrors = {};
    
    // Required fields validation
    if (!formData.date) {
      newErrors.date = "Date and time are required";
    }
    
    if (!formData.durationMinutes) {
      newErrors.durationMinutes = "Duration is required";
    }
    
    if (!formData.startLocation) {
      newErrors.startLocation = "Starting location is required";
    }
    
    if (formData.type === "neighborhood" && (!formData.invitedUserIds || formData.invitedUserIds.length === 0)) {
      newErrors.invitedUserIds = "No nearby walkers found in this neighborhood";
    }

    // Set the errors state
    setErrors(newErrors);
    
    // Form is valid if there are no errors
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  };

  // Validate form whenever formData changes
  useEffect(() => {
    validateForm();
  }, [formData]);

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
        errors,
        validateForm,
        isValid,
        systemErrors,
        setSystemErrors,
        createdWalkId,
        setCreatedWalkId,
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
