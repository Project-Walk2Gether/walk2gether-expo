import { useWalkForm } from "@/context/WalkFormContext";
import {
  MarkdownTextInput,
  parseExpensiMark,
} from "@expensify/react-native-live-markdown";
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
      continueDisabled={!formData.topic}
    >
      <YStack space="$4">
        <Card
          backgroundColor="white"
          borderRadius={12}
          elevation={2}
          padding="$4"
        >
          <YStack space="$4">
            <Text fontSize={24} fontWeight="600">
              Topic for Your Meetup
            </Text>
            <Text fontSize={16} color="#555">
              What would you like to discuss during your walk?
            </Text>
            <Input
              placeholder="Enter your topic..."
              value={formData.topic || ""}
              onChangeText={(text) => updateFormData({ topic: text })}
            />

            <Text fontWeight="bold" marginTop="$2">
              Description (Markdown)
            </Text>

            <MarkdownTextInput
              value={formData.descriptionMarkdown || ""}
              onChangeText={(text) =>
                updateFormData({ descriptionMarkdown: text })
              }
              parser={parseExpensiMark}
              placeholder="Add details about your meetup using markdown..."
              style={{ minHeight: 150 }}
            />
          </YStack>
        </Card>
      </YStack>
    </WizardWrapper>
  );
};

export default TopicSelection;
