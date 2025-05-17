import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalkForm, WalkFormData } from "@/context/WalkFormContext";
import { createWalkFromForm } from "@/utils/walkSubmission";
import { useQuoteOfTheDay } from "@/utils/quotes";
import { Timestamp } from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import HeaderBackButton from "../HeaderBackButton";
import {
  DurationSelection,
  LocationSelection,
  ReviewScreen,
  TimeSelection,
  TypeSelection,
} from "./sections";

// Define the structure of a wizard step
interface WizardStep {
  title: string;
  component: React.ComponentType<any>; // Using any here as we'll properly type when rendering
}

export function WalkWizard() {
  const {
    formData,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setFormData,
  } = useWalkForm();
  const router = useRouter();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { showMessage } = useFlashMessage();

  // If a friendId is provided, set it in the form data and skip to time selection
  useEffect(() => {
    if (friendId) {
      // Set the friend as an invited user and set the walk type
      setFormData((prev: WalkFormData) => ({
        ...prev,
        invitedUserIds: friendId ? [friendId] : prev.invitedUserIds,
        type: "friends",
      }));

      // Skip the first two steps (type selection and invite selection)
      // Go directly to step 3 (index 2) which is time selection
      goToStep(2);
    }
  }, [friendId]);

  // Get the quote advancement function
  const { advanceToNextQuote } = useQuoteOfTheDay();

  const handleSubmit = useCallback(async () => {
    if (!userData) {
      showMessage("User data not found", "error");
      return;
    }

    const walkDoc = await createWalkFromForm({
      formData,
      userData,
    });

    if (!walkDoc) return;
    
    // Advance to the next quote when a walk is successfully created
    advanceToNextQuote();

    // For friend walks, navigate to the invite screen after creation
    if (formData.type === "friends") {
      router.replace(`/walks/${walkDoc.id}/invite`);
    } else {
      // For other walk types, navigate to the main walk page
      router.replace(`/walks/${walkDoc.id}`);
    }
  }, [formData, router, userData, user, advanceToNextQuote]);

  const handleBackPress = useCallback(() => {
    if (currentStep > 0) {
      goToPreviousStep();
    } else {
      // Close the modal
      router.back();
    }
  }, [currentStep, goToPreviousStep, router]);

  // Define the step configuration - using useMemo to avoid recreating the array on each render
  const wizardSteps = useMemo<WizardStep[]>(() => {
    // First step is always type selection
    const baseSteps = [
      {
        title: "Please select type of walk",
        component: TypeSelection, // Only needs onContinue
      },
    ];

    // If this is a neighborhood walk, use a simplified flow
    if (formData.type === "neighborhood") {
      return [
        ...baseSteps,
        {
          title: "Where is the meetup point?",
          component: LocationSelection, // Needs onContinue and onBack
        },
        {
          title: "Review & Submit",
          component: ReviewScreen, // Needs onSubmit, onBack, and onEdit
        },
      ];
    }

    // For friend walks, use the full flow
    return [
      ...baseSteps,
      {
        title: "When do you want to walk?",
        component: TimeSelection, // Needs onContinue and onBack
      },
      {
        title: "How long will this walk be?",
        component: DurationSelection, // Needs onContinue and onBack
      },
      {
        title: "Where is the meetup point?",
        component: LocationSelection, // Needs onContinue and onBack
      },
      {
        title: "Review & Submit",
        component: ReviewScreen, // Needs onSubmit, onBack, and onEdit
      },
    ];
  }, [formData.type]);
  // Get screen title based on current step
  const getScreenTitle = () => {
    // Special case for step 0 (type selection)
    if (currentStep === 0) {
      return "What type of walk?";
    }

    // Return the title from wizardSteps if available
    if (currentStep < wizardSteps.length) {
      return wizardSteps[currentStep].title;
    }

    // Fallback
    return "Create a Walk";
  };

  // Set default values for neighborhood walks
  useEffect(() => {
    if (formData.type === "neighborhood") {
      // Default date to now for neighborhood walks if not set
      if (!formData.date) {
        setFormData((prev) => ({
          ...prev,
          date: Timestamp.now(),
        }));
      }

      // Default duration to 30 minutes if not set
      if (!formData.durationMinutes) {
        setFormData((prev) => ({
          ...prev,
          durationMinutes: 30,
        }));
      }
    }
  }, [formData.type]);

  // Render the appropriate step based on currentStep
  const renderStep = () => {
    if (currentStep >= 0 && currentStep < wizardSteps.length) {
      const StepComponent = wizardSteps[currentStep].component;

      // First step (Type Selection) only needs onContinue
      if (currentStep === 0) {
        return <StepComponent onContinue={goToNextStep} />;
      }

      // Last step (Review Screen) needs onSubmit, onBack, and onEdit
      if (currentStep === wizardSteps.length - 1) {
        return (
          <StepComponent
            onSubmit={handleSubmit}
            onBack={goToPreviousStep}
            onEdit={goToStep}
          />
        );
      }

      // Middle steps need onContinue and onBack
      return (
        <StepComponent onContinue={goToNextStep} onBack={goToPreviousStep} />
      );
    }

    // Default fallback
    const DefaultComponent = wizardSteps[0].component;
    return <DefaultComponent onContinue={goToNextStep} />;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: getScreenTitle(),
          headerLeft: () => <HeaderBackButton onPress={handleBackPress} />,
        }}
      />

      {renderStep()}
    </>
  );
}
