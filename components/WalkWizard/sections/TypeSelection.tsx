import { useWalkForm } from "@/context/WalkFormContext";
import React from "react";
import { YStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import { COLORS } from "../../../styles/colors";
import WalkTypeCard from "../../WalkTypeCard";
import WizardWrapper from "./WizardWrapper";

interface TypeSelectionProps {
  onContinue: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const TypeSelection: React.FC<TypeSelectionProps> = ({
  onContinue,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData } = useWalkForm();

  // When a type is selected, update the form data and then advance to the next step
  const setSelectedWalkType = (type: Walk["type"]) => {
    updateFormData({ type });
    // After a short delay, advance to the next step
    // This gives time for the form state to update
    setTimeout(() => {
      onContinue();
    }, 100);
  };

  return (
    <WizardWrapper
      onContinue={onContinue}
      hideFooter={true}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <YStack gap="$4" paddingBottom="$4" paddingHorizontal={16}>
        <WalkTypeCard
          type="friends"
          title="Friend Walk"
          icon="people-outline"
          color={COLORS.walkTypes.friends.main}
          backgroundColor={COLORS.walkTypes.friends.background}
          description="Schedule a walk with a friend"
          onSelect={setSelectedWalkType}
        />
        <WalkTypeCard
          type="neighborhood"
          title="Neighborhood Walk"
          icon="home-outline"
          color={COLORS.walkTypes.neighborhood.main}
          backgroundColor={COLORS.walkTypes.neighborhood.background}
          description="Start a walk in your neighborhood"
          onSelect={setSelectedWalkType}
        />
        <WalkTypeCard
          type="meetup"
          title="Meetup Walk"
          icon="chatbubbles-outline"
          color={COLORS.walkTypes.meetup.main}
          backgroundColor={COLORS.walkTypes.meetup.background}
          description="Schedule a walk with a topic, and invite the public"
          onSelect={setSelectedWalkType}
        />
      </YStack>
    </WizardWrapper>
  );
};

export default TypeSelection;
