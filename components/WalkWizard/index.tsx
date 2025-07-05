import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { useDoc } from "@/utils/firestore";
import { useQuoteOfTheDay } from "@/utils/quotes";
import { updateExistingWalk } from "@/utils/updateWalk";
import { createWalkFromForm } from "@/utils/walkSubmission";
import { Timestamp } from "@react-native-firebase/firestore";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { Button, View, XStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import {
  DurationSelection,
  InviteSelection,
  LocationSelection,
  QuoteSection,
  TimeSelection,
  TypeSelection,
  TopicSelection,
} from "./sections";
import NeighborhoodWalkHowItWorksSection from "./sections/NeighborhoodWalkHowItWorksSection";
import { WizardHeader } from "./sections/WizardHeader";

// Define the structure of a wizard step with UI components
interface WizardStepWithComponents {
  key: string;
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
    wizardSteps: formSteps,
    setFormData,
    createdWalkId,
    setCreatedWalkId,
  } = useWalkForm();
  const router = useRouter();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();

  // Get the quote advancement function
  const { advanceToNextQuote } = useQuoteOfTheDay();

  const handleSubmit = useCallback(async () => {
    console.log("submitting");
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

  // Enhance the step configuration with components and navigation handlers
  const wizardSteps = useMemo<WizardStepWithComponents[]>(() => {
    // Map each step key to its corresponding component and handlers
    const getComponentForKey = (key: string) => {
      switch (key) {
        case "type":
          return {
            component: TypeSelection,
            onContinue: goToNextStep,
          };
        case "howItWorks":
          return {
            component: NeighborhoodWalkHowItWorksSection,
            onContinue: goToNextStep,
            onBack: goToPreviousStep,
          };
        case "time":
          return {
            component: TimeSelection,
            onContinue: goToNextStep,
            onBack: goToPreviousStep,
          };
        case "location":
          return {
            component: LocationSelection,
            onContinue: goToNextStep,
            onBack: goToPreviousStep,
          };
        case "topic":
          return {
            component: TopicSelection,
            onContinue: goToNextStep,
            onBack: goToPreviousStep,
          };
        case "duration":
          return {
            component: DurationSelection,
            onContinue: handleSubmit,
            onBack: goToPreviousStep,
          };
        case "invite":
          return {
            component: InviteSelection,
            onContinue: goToNextStep,
            onBack: goToPreviousStep,
          };
        case "quote":
          return {
            component: QuoteSection,
            onContinue: goToNextStep, // This will close the wizard since it's the last step
            onBack: goToPreviousStep,
          };
        default:
          return {
            component: TypeSelection,
            onContinue: goToNextStep,
          };
      }
    };

    // Enhance each step with its component and handlers
    return formSteps.map((step) => ({
      ...step,
      ...getComponentForKey(step.key),
    }));
  }, [formSteps, formData.type, goToNextStep, goToPreviousStep, handleSubmit]);

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
        displayDots={currentStep > 0}
        currentStep={currentStep}
        totalSteps={wizardSteps.length - 1}
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

  // We're now using goToStepByKey from the WalkFormContext directly

  // Fetch the created walk if we have an ID
  const { doc: createdWalk } = useDoc<Walk>(
    createdWalkId ? `walks/${createdWalkId}` : undefined
  );

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
          walk={createdWalk} // Pass the walk object to all steps
          walkId={createdWalkId} // Keep this for backwards compatibility
          walkType={formData.type} // Keep this for backwards compatibility
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
