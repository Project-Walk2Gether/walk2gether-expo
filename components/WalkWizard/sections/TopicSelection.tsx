import { useWalkForm } from "@/context/WalkFormContext";
import {
  MarkdownTextInput,
  parseExpensiMark,
} from "@expensify/react-native-live-markdown";
import React, { useState } from "react";
import { Card, Input, Text, YStack, Button, XStack } from "tamagui";
import { HelpCircle } from "@tamagui/lucide-icons";
import MarkdownHelpModal from "@/components/MarkdownHelpModal";
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
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

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
      <YStack gap="$4">
        <Card
          backgroundColor="white"
          borderRadius={12}
          elevation={2}
          padding="$4"
        >
          <YStack gap="$4">
            <Text fontSize={24} fontWeight="bold">
              Set your meetup walk topic
            </Text>
            <Text fontSize={16} color="#555">
              What's your walk about? This topic helps others find and RSVP to
              your walk.
            </Text>
            <Input
              placeholder="Enter your topic..."
              value={formData.topic || ""}
              onChangeText={(text) => updateFormData({ topic: text })}
              backgroundColor="#f8f8f8"
              borderRadius={8}
            />

            <Text fontWeight="bold" marginTop="$2">
              Description
            </Text>
            
            <XStack alignItems="center" gap="$2" marginBottom="$1">
              <Text fontSize={14} color="$gray10">Supports markdown</Text>
              <Button
                size="$2"
                circular
                icon={<HelpCircle size={16} color="$gray10" />}
                transparent
                onPress={() => setShowMarkdownHelp(true)}
              />
            </XStack>

            <MarkdownTextInput
              value={formData.descriptionMarkdown || ""}
              onChangeText={(text) =>
                updateFormData({ descriptionMarkdown: text })
              }
              parser={parseExpensiMark}
              placeholder="Describe the topic so more people in the public might want to join"
              style={{
                minHeight: 150,
                textAlignVertical: "top",
                paddingTop: 12,
                paddingBottom: 12,
                paddingHorizontal: 12,
                backgroundColor: "#f8f8f8",
                borderColor: "#eaeaea",
                borderWidth: 1,
                borderRadius: 8,
              }}
              multiline={true}
              numberOfLines={5}
            />
          </YStack>
        </Card>
      </YStack>
      
      <MarkdownHelpModal 
        open={showMarkdownHelp} 
        onOpenChange={setShowMarkdownHelp} 
      />
    </WizardWrapper>
  );
};

export default TopicSelection;
