import { useAuth } from "@/context/AuthContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalkForm, WalkFormData } from "@/context/WalkFormContext";
import { useWalks } from "@/context/WalksContext";
import { createWalkFromForm } from "@/utils/walkSubmission";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import Toast from "react-native-toast-message";
import HeaderBackButton from "../HeaderBackButton";
import {
  DurationSelection,
  InviteSelection,
  LocationSelection,
  NeighborhoodConfirmationScreen,
  ReviewScreen,
  TimeSelection,
  TypeSelection,
} from "./sections";

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
  const { createWalk } = useWalks();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();

  // If a friendId is provided, set it in the form data and skip to time selection
  useEffect(() => {
    if (friendId) {
      // Set the friend as an invited user and set the walk type
      setFormData((prev: WalkFormData) => ({
        ...prev,
        invitedUserIds: friendId ? [friendId] : prev.invitedUserIds,
        walkType: "friends",
      }));

      // Skip the first two steps (type selection and invite selection)
      // Go directly to step 3 (index 2) which is time selection
      console.log("Running", { friendId });
      goToStep(2);
    }
  }, [friendId]);

  const handleSubmit = useCallback(async () => {
    if (!user) return;

    await createWalkFromForm({
      formData,
      userData,
      userId: user.uid,
      createWalk,
      router,
    });
  }, [formData, createWalk, router, userData, user]);

  // We don't need to do additional logic when we have a friendId since we set the walkType in the first useEffect above

  const handleBackPress = useCallback(() => {
    if (currentStep > 0) {
      goToPreviousStep();
    } else {
      // Close the modal
      router.back();
    }
  }, [currentStep, goToPreviousStep, router]);

  // Define the step configuration
  const wizardSteps = [
    {
      title: "What type of walk?",
      Component: () => <TypeSelection onContinue={goToNextStep} />,
    },
    {
      title: "Who should we invite?",
      Component: () => (
        <InviteSelection onContinue={goToNextStep} onBack={goToPreviousStep} />
      ),
    },
    {
      title: "When do you want to walk?",
      Component: () => (
        <TimeSelection onContinue={goToNextStep} onBack={goToPreviousStep} />
      ),
    },
    {
      title: "How long will this walk be?",
      Component: () => (
        <DurationSelection
          onContinue={goToNextStep}
          onBack={goToPreviousStep}
        />
      ),
    },
    {
      title: "Where is the meetup point?",
      Component: () => (
        <LocationSelection
          onContinue={goToNextStep}
          onBack={goToPreviousStep}
        />
      ),
    },
    {
      title: "Review & Submit",
      Component: () => (
        <ReviewScreen
          onSubmit={handleSubmit}
          onBack={goToPreviousStep}
          onEdit={goToStep}
        />
      ),
    },
  ];

  // Get screen title based on current step
  const getScreenTitle = () => {
    if (formData.walkType === "neighborhood") {
      return currentStep === 0
        ? "What type of walk?"
        : "Start a Neighborhood Walk";
    } else {
      return currentStep < wizardSteps.length
        ? wizardSteps[currentStep].title
        : "Create a Walk";
    }
  };

  // Render the appropriate step based on currentStep
  const renderStep = () => {
    // Special flow for neighborhood walks
    if (formData.walkType === "neighborhood" && currentStep > 0) {
      // For neighborhood walks, set default values to simplify the experience
      if (!formData.date) {
        // Default date to now for neighborhood walks
        formData.date = new Date();
      }

      if (!formData.duration) {
        // Default duration to 30 minutes
        formData.duration = 30;
      }

      return (
        <NeighborhoodConfirmationScreen
          onSubmit={handleSubmit}
          onBack={goToPreviousStep}
        />
      );
    }

    // Regular flow for other walk types
    if (currentStep >= 0 && currentStep < wizardSteps.length) {
      const StepComponent = wizardSteps[currentStep].Component;
      return <StepComponent />;
    }

    // Default fallback
    const DefaultComponent = wizardSteps[0].Component;
    return <DefaultComponent />;
  };

  console.log("rendering parent");

  return (
    <>
      <Stack.Screen
        options={{
          title: getScreenTitle(),
          headerLeft: () => <HeaderBackButton onPress={handleBackPress} />,
        }}
      />
      <Toast />
      {renderStep()}
    </>
  );
}
