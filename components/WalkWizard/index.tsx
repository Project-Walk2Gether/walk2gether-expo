import { Timestamp } from "@react-native-firebase/firestore";
import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";
import uuid from "react-native-uuid";
import { Walk } from "walk2gether-shared";
import { useAuth } from "../../context/AuthContext";
import { useUserData } from "../../context/UserDataContext";
import { useWalkForm } from "../../context/WalkFormContext";
import { useWalks } from "../../context/WalksContext";
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
    if (!formData.date || !formData.location || !formData.duration) {
      console.error("Missing required form data");
      return;
    }

    try {
      // Generate a unique invitation code
      const invitationCode = uuid.v4().toString().slice(0, 8);

      // Convert form data to the Walk format
      // Using type assertion to include the invitationCode property
      // Create location object from form data
      const locationData = {
        name: formData.location.name,
        placeId: "", // Default empty string for placeId
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
      };
      
      // Create complete walk payload with all required fields from the Walk type
      const walkPayload = {
        // Basic walk properties
        active: false,
        date: Timestamp.fromDate(formData.date),
        durationMinutes: formData.duration,
        organizerName: userData?.name || "",
        createdByUid: user!.uid,
        type: formData.walkType as any,
        
        // Location data - For friends walk, both start and current are the same initially
        startLocation: locationData,
        currentLocation: locationData,
        location: locationData, // This is used in UI for display purposes
        
        // Invitation details
        invitationCode: invitationCode,
        invitedUserIds: formData.invitedUserIds || [],
        invitedPhoneNumbers: formData.invitedPhoneNumbers || [],
        rsvpdUserIds: [],
        
        // Additional required fields for Friends walk
        rounds: [],
      } as unknown as Walk; // Cast to unknown first to resolve type mismatch

      // Create the walk
      await createWalk(walkPayload);

      // If there are phone numbers to invite, send SMS invitations
      const phoneNumbers = formData.invitedPhoneNumbers || [];
      if (phoneNumbers.length > 0) {
        try {
          console.log("Sending SMS invitations to:", phoneNumbers);
          // This would typically call a Cloud Function to send SMS invites
          // We'll implement this functionality on the backend
        } catch (error) {
          console.error("Error sending SMS invitations:", error);
        }
      }

      // Immediately redirect to home screen after creating a walk
      router.back();

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
