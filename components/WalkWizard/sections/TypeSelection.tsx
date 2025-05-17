import { useWalkForm } from "@/context/WalkFormContext";
import React from "react";
import { YStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import WalkTypeCard from "../../WalkTypeCard";
import WizardWrapper from "./WizardWrapper";

interface TypeSelectionProps {
  onContinue: () => void;
}

export const TypeSelection: React.FC<TypeSelectionProps> = ({ onContinue }) => {
  const { formData, updateFormData } = useWalkForm();

  // When a type is selected, update the form data and proceed
  const setSelectedWalkType = (type: Walk["type"]) => {
    updateFormData({ type });
    onContinue();
  };

  return (
    <WizardWrapper
      onContinue={onContinue}
      hideFooter={true}
    >
      <YStack gap="$4" paddingBottom="$4">
        <WalkTypeCard
          type="friends"
          title="Friend Walk"
          icon="people-outline"
          color="#5A67F2"
          backgroundColor="#E7E9FE"
          description="Schedule a walk with a friend in the future"
          selected={formData.type === "friends"}
          onSelect={setSelectedWalkType}
        />
        <WalkTypeCard
          type="neighborhood"
          title="Neighborhood Walk"
          icon="home-outline"
          color="#47C97E"
          backgroundColor="#E4F6ED"
          description="Start a walk in your neighborhood now"
          selected={formData.type === "neighborhood"}
          onSelect={setSelectedWalkType}
        />
      </YStack>
    </WizardWrapper>
  );
};

export default TypeSelection;
