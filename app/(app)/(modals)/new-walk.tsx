import { useWalks } from "@/context/WalksContext.bak";
import { Timestamp } from "@react-native-firebase/firestore";
import { Stack, useRouter } from "expo-router";
import { nanoid } from "nanoid/non-secure";
import React, { useCallback } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "tamagui";
import { Walk } from "walk2gether-shared";
import HeaderBackButton from "../../../components/HeaderBackButton";
import { BrandGradient } from "../../../components/UI";
import {
  DurationSelection,
  InviteSelection,
  LocationSelection,
  NeighborhoodConfirmationScreen,
  ReviewScreen,
  TimeSelection,
  TypeSelection,
} from "../../../components/WalkWizard";
import { useAuth } from "../../../context/AuthContext";
import { useUserData } from "../../../context/UserDataContext";
import {
  WalkFormProvider,
  useWalkForm,
} from "../../../context/WalkFormContext";

function WalkWizard() {
  const { formData, currentStep, goToNextStep, goToPreviousStep, goToStep } =
    useWalkForm();
  const router = useRouter();
  const { createWalk, isSubmitting } = useWalks();
  const { user } = useAuth();
  const { userData } = useUserData();

  const handleSubmit = useCallback(async () => {
    if (!formData.date || !formData.location || !formData.duration) {
      console.error("Missing required form data");
      return;
    }

    try {
      // Generate a unique invitation code
      const invitationCode = nanoid(8);

      // Convert form data to the Walk format
      // Using type assertion to include the invitationCode property
      const walkPayload = {
        active: false,
        location: {
          name: formData.location.name,
          placeId: "",
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
        },
        date: Timestamp.fromDate(formData.date),
        durationMinutes: formData.duration,
        organizerName: userData?.name || "",
        createdByUid: user!.uid,
        type: formData.walkType as any,
        invitationCode: invitationCode, // Add the invitation code to the walk
      } as Walk;

      await createWalk(walkPayload);

      // Immediately redirect to home screen after creating a walk
      router.replace("/home");

      // Show confetti animation after a delay once the screen is closed
      setTimeout(() => {
        // showConfetti(0);
      }, 600);
    } catch (error) {
      console.error("Error creating walk:", error);
      // TODO: Show error message
    }
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
          return "Where is the meeting point?";
        case 3:
          return "How long will this walk be?";
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
    if (isSubmitting) {
      return (
        <BrandGradient style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text color="white" fontSize={18} marginTop={20}>
              Creating your walk...
            </Text>
          </View>
        </BrandGradient>
      );
    }

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
          <LocationSelection
            onContinue={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 3:
        return (
          <DurationSelection
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

// Wrap the entire screen with our WalkFormProvider
export default function NewWalkWizardScreen() {
  return (
    <WalkFormProvider>
      <WalkWizard />
    </WalkFormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
