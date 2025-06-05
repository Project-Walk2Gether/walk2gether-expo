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

// Define the structure of a wizard step
interface WizardStep {
  key: string;
  title: string;
}

// TODO: simply defininng this as Partial<Walk> is not a particularly strong approach
export type WalkFormData = Partial<Walk> & {
  // Include any additional fields needed for the form but not in the Walk type
  participantUids?: string[];
  participantUids?: string[];
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
  friendId?: string;
}

export const WalkFormProvider: React.FC<Props> = ({ friendId, children }) => {
  // Initialize form with a fresh invitation code on each form creation
  const { userData } = useUserData();
  const initializedFormData: WalkFormData = {
    ...initialFormData,
    date: Timestamp.now(),
    startLocation: userData?.location || undefined,
  };
  const [formData, setFormData] = useState<WalkFormData>(initializedFormData);
  const [currentStep, setCurrentStep] = useState(friendId ? 1 : 0);
  const [errors, setErrors] = useState<WalkFormErrors>({});
  const [isValid, setIsValid] = useState(true);
  // System-level errors (e.g., API failures)
  const [systemErrors, setSystemErrors] = useState<string[]>([]);
  // Track if a walk has been created already
  const [createdWalkId, setCreatedWalkId] = useState<string | null>(null);
  const showHowItWorks = useMemo(() => {
    return userData && !userData.neighborhoodWalksHowItWorksDontShowAgain;
  }, [userData]);

  // Define wizard steps based on the walk type
  const wizardSteps = useMemo<WizardStep[]>(() => {
    const baseSteps = [
      {
        key: "type",
        title: "Select walk type",
      },
    ];

    if (formData.type === "neighborhood") {
      return [
        ...baseSteps,
        ...(showHowItWorks
          ? [
              {
                key: "howItWorks",
                title: "How it works",
              },
            ]
          : []),
        {
          key: "location",
          title: "Select start point",
        },
        {
          key: "duration",
          title: "Set duration",
        },

        {
          key: "invite",
          title: "Invite",
        },
      ];
    }

    // For friend walks, use the full flow
    return [
      ...baseSteps,
      {
        key: "time",
        title: "Select date and time",
      },
      {
        key: "location",
        title: "Select start point",
      },
      {
        key: "duration",
        title: "Set duration",
      },
      {
        key: "invite",
        title: "Invite",
      },
    ];
  }, [formData.type, showHowItWorks]);

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
