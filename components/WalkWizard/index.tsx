import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalkForm, WalkFormData } from "@/context/WalkFormContext";
import { useQuoteOfTheDay } from "@/utils/quotes";
import { updateExistingWalk } from "@/utils/updateWalk";
import { createWalkFromForm } from "@/utils/walkSubmission";
import { Timestamp } from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { Button, View, XStack } from "tamagui";
import {
  DurationSelection,
  InviteSelection,
  LocationSelection,
  TimeSelection,
  TypeSelection,
} from "./sections";
import { WizardHeader } from "./sections/WizardHeader";

// Define the structure of a wizard step
interface WizardStep {
  title: string;
  component: React.ComponentType<any>;
  onContinue: () => void;
  onBack?: () => void;
}

export function WalkWizard() {
  const {
    formData,
    currentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    setFormData,
    createdWalkId,
    setCreatedWalkId,
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
    }
  }, [friendId]);

  // Get the quote advancement function
  const { advanceToNextQuote } = useQuoteOfTheDay();

  const handleSubmit = useCallback(async () => {
    if (!userData) {
      showMessage("User data not found", "error");
      return;
    }

    // If we already have a created walk ID, update the existing walk instead of creating a new one
    if (createdWalkId) {
      console.log(
        `Updating existing walk ${createdWalkId} instead of creating a new one`
      );
      const success = await updateExistingWalk({
        walkId: createdWalkId,
        formData,
        userData,
      });

      if (!success) {
        showMessage("Failed to update walk", "error");
        return;
      }

      // For friend walks, advance to invite step
      if (formData.type === "friends") {
        goToNextStep();
      } else {
        // For other walk types, close the wizard (navigate away)
        router.back();
      }
      return;
    }

    // Create a new walk if we don't have an ID yet
    const walkDoc = await createWalkFromForm({
      formData,
      userData,
    });

    if (!walkDoc) return;

    // Store the created walk ID to prevent duplicate creation
    setCreatedWalkId(walkDoc.id);

    // Advance to the next quote when a walk is successfully created
    advanceToNextQuote();

    // Always call goToNextStep which will handle navigation appropriately
    // For friend walks, it will go to the invite step
    // For other walk types, if it's the last step, it will close the wizard
    goToNextStep();
  }, [
    formData,
    router,
    userData,
    user,
    advanceToNextQuote,
    goToNextStep,
    createdWalkId,
    setCreatedWalkId,
    showMessage,
  ]);

  // Define the step configuration - using useMemo to avoid recreating the array on each render
  const wizardSteps = useMemo<WizardStep[]>(() => {
    const baseSteps = [
      {
        title: "Select walk type",
        component: TypeSelection,
        onContinue: goToNextStep,
      },
    ];

    if (formData.type === "neighborhood") {
      return [
        ...baseSteps,
        {
          title: "Select start point",
          component: LocationSelection,
          onContinue: goToNextStep,
          onBack: goToPreviousStep,
        },
        {
          title: "Set duration",
          component: DurationSelection,
          onContinue: handleSubmit,
          onBack: goToPreviousStep,
        },
      ];
    }

    // For friend walks, use the full flow
    return [
      ...baseSteps,
      {
        title: "Select date and time",
        component: TimeSelection,
        onContinue: goToNextStep,
        onBack: goToPreviousStep,
      },
      {
        title: "Select start point",
        component: LocationSelection,
        onContinue: goToNextStep,
        onBack: goToPreviousStep,
      },
      {
        title: "Set duration",
        component: DurationSelection,
        onContinue: handleSubmit,
        onBack: goToPreviousStep,
      },
      {
        title: "Invite",
        component: InviteSelection,
        onContinue: goToNextStep, // This will close the wizard since it's the last step
        onBack: goToPreviousStep,
      },
    ];
  }, [formData.type, goToNextStep, goToPreviousStep, goToStep, handleSubmit]);

  // Create a custom header component for the Stack.Screen
  const renderHeader = () => {
    // Get the title from wizardSteps if available
    const title =
      currentStep < wizardSteps.length
        ? wizardSteps[currentStep].title
        : "Create a Walk";

    return (
      <WizardHeader
        title={title}
        currentStep={currentStep + 1}
        totalSteps={wizardSteps.length}
      />
    );
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
    if (currentStep >= wizardSteps.length) {
      // No more steps to render, close the wizard
      router.back();
      return null;
    }
    if (currentStep >= 0 && currentStep < wizardSteps.length) {
      const {
        component: StepComponent,
        onContinue,
        onBack,
      } = wizardSteps[currentStep];
      return (
        <StepComponent
          onContinue={onContinue}
          onBack={onBack}
          currentStep={currentStep + 1}
          totalSteps={wizardSteps.length}
        />
      );
    }
    // Default fallback
    const DefaultComponent = wizardSteps[0].component;
    return <DefaultComponent onContinue={goToNextStep} />;
  };

  const { systemErrors = [] } = useWalkForm();

  return (
    <>
      <Stack.Screen
        options={{
          header: renderHeader,
          headerShown: true,
        }}
      />
      {systemErrors && systemErrors.length > 0 && (
        <View marginTop={16} paddingHorizontal={16}>
          {systemErrors.map((err: string, idx: number) => (
            <View key={idx} marginBottom={8}>
              <XStack alignItems="center" gap={8}>
                <View
                  width={6}
                  height={6}
                  borderRadius={3}
                  backgroundColor="red"
                  marginRight={8}
                />
                <Button
                  size="$2"
                  chromeless
                  backgroundColor="transparent"
                  color="red"
                  disabled
                  style={{ textAlign: "left", flex: 1 }}
                >
                  {err}
                </Button>
              </XStack>
            </View>
          ))}
        </View>
      )}

      {renderStep()}
    </>
  );
}
