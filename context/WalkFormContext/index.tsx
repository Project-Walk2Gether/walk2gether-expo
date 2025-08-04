import { useUserData } from "@/context/UserDataContext";
import { Timestamp } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Walk } from "walk2gether-shared";
import { WizardStep } from "./steps";
import { getWalkTypeConfig } from "./walkTypes";

// WizardStep is now imported from ./steps

// Define the form data type with all possible fields
export type WalkFormData = Partial<Walk> & {
  // Additional fields needed for the form
  participantUids?: string[];
  invitationCode?: string;
  // Topic field for meetup walks
  topic?: string;
} & {
  // Default values for different walk types
  [key: string]: any;
};

// Define a type for form errors with the same shape as the form data
export type WalkFormErrors = {
  [K in keyof WalkFormData]?: string;
};

interface WalkFormContextType {
  friendId?: string;
  formData: WalkFormData;
  updateFormData: (newData: Partial<Walk>) => void;
  setFormData: React.Dispatch<React.SetStateAction<WalkFormData>>;
  resetForm: () => void;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  goToStepByKey: (key: string) => void;
  wizardSteps: WizardStep[];
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
  // Close the entire walk form modal
  closeWalkForm: () => void;
  // Submit handler
  onSubmit: (
    formData: WalkFormData,
    createdWalkId: string | null,
    setCreatedWalkId: (id: string) => void,
    goToNextStep: () => void
  ) => Promise<void>;
  // Edit mode
  isEditMode: boolean;
  existingWalk?: Walk;
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
  invitationCode: generateInvitationCode(),
  topic: "", // Initialize topic as empty string for meetup walks
};

const WalkFormContext = createContext<WalkFormContextType | undefined>(
  undefined
);

export interface Props {
  children: React.ReactNode;
  friendId?: string;
  onSubmit?: (
    formData: WalkFormData,
    createdWalkId: string | null,
    setCreatedWalkId: (id: string) => void,
    goToNextStep: () => void
  ) => Promise<void>;
  existingWalk?: Walk;
}

export const WalkFormProvider: React.FC<Props> = ({
  friendId,
  children,
  onSubmit,
  existingWalk,
}) => {
  // Initialize form with a fresh invitation code on each form creation
  const { userData } = useUserData();
  // Initialize form data with default values and friendId if available
  const initializedFormData: WalkFormData = existingWalk
    ? {
        ...existingWalk,
        // Preserve any additional form-specific fields
        invitationCode:
          (existingWalk as any).invitationCode || generateInvitationCode(),
        topic: (existingWalk as any).topic || "",
      }
    : {
        ...initialFormData,
        participantUids: friendId ? [friendId] : [],
      };
  const [formData, setFormData] = useState<WalkFormData>(initializedFormData);
  const [currentStep, setCurrentStep] = useState(
    existingWalk ? 0 : friendId ? 1 : 0
  );
  const [errors, setErrors] = useState<WalkFormErrors>({});
  const [isValid, setIsValid] = useState(true);
  // System-level errors (e.g., API failures)
  const [systemErrors, setSystemErrors] = useState<string[]>([]);
  // Track if a walk has been created already
  const [createdWalkId, setCreatedWalkId] = useState<string | null>(null);
  const showHowItWorks = useMemo(() => {
    return !!userData && !userData.neighborhoodWalksHowItWorksDontShowAgain;
  }, [userData]);

  // Define wizard steps based on the walk type
  const wizardSteps = useMemo<WizardStep[]>(() => {
    // Get the steps for the selected walk type
    const walkTypeConfig = getWalkTypeConfig(formData.type);
    const steps = walkTypeConfig.getSteps(showHowItWorks ?? undefined);
    return steps;
  }, [formData, showHowItWorks]); // Changed from [formData.type] to [formData] to ensure steps are recalculated properly

  const totalSteps = wizardSteps.length;

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

  // Function to navigate to a step by its key
  const goToStepByKey = (key: string) => {
    const stepIndex = wizardSteps.findIndex((step) => step.key === key);
    if (stepIndex !== -1) {
      goToStep(stepIndex);
    } else {
      console.warn(`No step found with key: ${key}`);
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

  // Set default values when walk type changes
  useEffect(() => {
    console.log("Walk type changed:", formData.type);
    if (formData.type) {
      const walkTypeConfig = getWalkTypeConfig(formData.type);
      const defaultValues = walkTypeConfig.defaultValues;

      // Apply default values if they're not already set
      setFormData((prev) => {
        console.log("Setting default values:", {
          prev,
          defaultValues,
          currentStep,
        });
        return {
          ...prev,
          // Apply default values from the walk type config
          ...Object.entries(defaultValues).reduce((acc, [key, value]) => {
            // Only set the value if it's not already set
            const typedKey = key as keyof typeof prev;
            if (
              prev[typedKey] === undefined ||
              (typedKey === "topic" && formData.type === "meetup")
            ) {
              // Type assertion to handle the complex types
              (acc as any)[typedKey] = value;
            }
            return acc;
          }, {} as WalkFormData),
          // Always ensure date is set
          date: prev.date || Timestamp.now(),
        };
      });
    }
  }, [formData.type]);

  // Function to close the entire walk form modal
  const closeWalkForm = () => {
    router.back();
  };

  return (
    <WalkFormContext.Provider
      value={{
        friendId,
        formData,
        updateFormData,
        setFormData,
        resetForm,
        currentStep,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        goToStepByKey,
        wizardSteps,
        totalSteps,
        errors,
        validateForm,
        isValid,
        systemErrors,
        setSystemErrors,
        createdWalkId,
        setCreatedWalkId,
        closeWalkForm,
        onSubmit,
        isEditMode: !!existingWalk,
        existingWalk,
      }}
    >
      {children}
    </WalkFormContext.Provider>
  );
};

export const useMaybeWalkForm = (): WalkFormContextType | undefined => {
  return useContext(WalkFormContext);
};

export const useWalkForm = (): WalkFormContextType => {
  const context = useContext(WalkFormContext);
  if (!context) {
    throw new Error("useWalkForm must be used within a WalkFormProvider");
  }
  return context;
};
