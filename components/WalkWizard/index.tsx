import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { useWalkForm } from "../../context/WalkFormContext";
import { useWalks } from "../../context/WalksContext";
import { createWalkFromForm } from "../../utils/walkSubmission";
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
  const { formData, currentStep, goToNextStep, goToPreviousStep, goToStep } =
    useWalkForm();
  const router = useRouter();
  const { createWalk } = useWalks();
  const { user } = useAuth();
  const { userData } = useUserData();

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

  const handleBackPress = useCallback(() => {
    if (currentStep > 0) {
      goToPreviousStep();
    } else {
      // Close the modal
      router.back();
    }
  }, [currentStep, goToPreviousStep, router]);

  // Get screen title based on current step
  const getScreenTitle = () => {
    if (formData.walkType === "neighborhood") {
      switch (currentStep) {
        case 0:
          return "What type of walk?";
        case 1:
          return "Start a Neighborhood Walk";
        default:
          return "Start a Neighborhood Walk";
      }
    } else {
      switch (currentStep) {
        case 0:
          return "What type of walk?";
        case 1:
          return "When do you want to walk?";
        case 2:
          return "How long will this walk be?";
        case 3:
          return "Where is the meetup point?";
        case 4:
          return "Who should we invite?";
        case 5:
          return "Review & Submit";
        default:
          return "Create a Walk";
      }
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
    switch (currentStep) {
      case 0:
        return <TypeSelection onContinue={goToNextStep} />;
      case 1:
        return (
          <TimeSelection onContinue={goToNextStep} onBack={goToPreviousStep} />
        );
      case 2:
        return (
          <DurationSelection
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <LocationSelection
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 4:
        return (
          <InviteSelection
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 5:
        return (
          <ReviewScreen
            onSubmit={handleSubmit}
            onBack={goToPreviousStep}
            onEdit={goToStep}
          />
        );
      default:
        return <TypeSelection onContinue={goToNextStep} />;
    }
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
