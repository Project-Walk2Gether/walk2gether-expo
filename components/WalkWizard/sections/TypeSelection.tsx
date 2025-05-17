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

  const setSelectedWalkType = (type: Walk["type"]) => {
    updateFormData({
      type: type,
    });

    // Automatically proceed when a type is selected
    if (type) {
      onContinue();
    }
  };

  return (
    <WizardWrapper
      onContinue={onContinue}
      continueDisabled={!formData.type}
      continueText="Continue"
      backText=""
    >
      <YStack gap="$4">
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
        {/*
        <WalkTypeCard
          type="meetup"
          title="Friend Group"
          icon="people"
          color="#FF6A55"
          backgroundColor="#FFE9E5"
          description="Walk with a group of friends"
          selected={formData.type === "meetup"}
          onSelect={setSelectedWalkType}
        /> */}

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
