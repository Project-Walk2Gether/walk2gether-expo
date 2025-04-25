import { Timestamp } from "@react-native-firebase/firestore";
import { Stack, useRouter } from "expo-router";
import { nanoid } from "nanoid/non-secure";
import React, { useCallback } from "react";
import { View as RNView } from "react-native";
import { Spinner, Text, View, YStack } from "tamagui";
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
import { useWalks } from "../../../context/WalksContext";

function WalkWizard() {
  const { formData, currentStep, goToNextStep, goToPreviousStep, goToStep } =
    useWalkForm();
  const router = useRouter();
  const { createWalk, isSubmitting } = useWalks();
  const { user } = useAuth();
  const { userData } = useUserData();

  const handleSubmit = useCallback(async () => {
    console.log({ formData });
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
        // Include the invited user IDs if available
        invitedUserIds: formData.invitedUserIds || [],
      } as Walk;

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
          return "Where is the meeting point?";
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
        <BrandGradient style={{ flex: 1 }}>
          <View
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding={20}
          >
            <Spinner size="large" color="white" />
            <Text
              color="white"
              fontSize={18}
              fontWeight="500"
              marginTop={16}
            >
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

// Wrap the entire screen with our WalkFormProvider
// Only import useEffect, useState from React here, since React and Text are already imported at the top
import { useEffect, useState } from "react";
import * as Location from "expo-location";

export default function NewWalkWizardScreen() {
  const [locationReady, setLocationReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateFormData } = require("../../../context/WalkFormContext");

  useEffect(() => {
    let isMounted = true;
    async function fetchLocation() {
      try {
        setError(null);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied.");
          setLocationReady(true);
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = position.coords;
        // Optionally, reverse geocode here or just set lat/lng
        updateFormData({
          location: {
            name: "Current Location",
            description: "Your current location",
            latitude,
            longitude,
          },
        });
      } catch (e: any) {
        setError("Unable to get your location.");
      } finally {
        if (isMounted) setLocationReady(true);
      }
    }
    fetchLocation();
    return () => { isMounted = false; };
  }, []);

  return (
    <WalkFormProvider>
      {locationReady ? (
        <WalkWizard />
      ) : (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Spinner size="large" color="$blue10" />
          <Text marginTop="$4" fontSize={18} color="$blue10">
            Getting your location...
          </Text>
          {error && (
            <Text marginTop="$2" color="$red10">{error}</Text>
          )}
        </YStack>
      )}
    </WalkFormProvider>
  );
}


