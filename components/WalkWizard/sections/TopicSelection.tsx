import { useWalkForm } from "@/context/WalkFormContext";
import React from "react";

import { Card, Input, Text, YStack } from "tamagui";
import WizardWrapper from "./WizardWrapper";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const TopicSelection: React.FC<Props> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData } = useWalkForm();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <WizardWrapper
      onContinue={handleContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueText="Continue"
    >
      <YStack gap="$4">
        <Text fontSize={24} fontWeight="600">
          Topic for Your Meetup
        </Text>
        <Text fontSize={16} color="#555">
          What would you like to discuss during your walk?
        </Text>
        <Card
          backgroundColor="white"
          borderRadius={12}
          elevation={2}
          padding="$4"
        >
          <Input
            placeholder="Enter your topic..."
            value={formData.topic || ""}
            onChangeText={(text) => updateFormData({ topic: text })}
            style={{
              fontSize: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: "#f5f5f5",
            }}
          />
        </Card>
      </YStack>
    </WizardWrapper>
  );
};

export default TopicSelection;
