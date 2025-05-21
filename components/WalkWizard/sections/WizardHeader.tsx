import React from "react";
import { Text, View, XStack, YStack } from "tamagui";
import HeaderCloseButton from "../../HeaderCloseButton";
import ProgressDots from "../../UI/ProgressDots";

interface WizardHeaderProps {
  title: string;
  currentStep: number;
  displayDots?: boolean;
  totalSteps: number;
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  title,
  currentStep,
  displayDots,
  totalSteps,
}) => {
  return (
    <XStack
      width="100%"
      paddingHorizontal={16}
      backgroundColor="white"
      py={"$2.5"}
      alignItems="center"
      justifyContent="space-between"
      borderBottomWidth={1}
      borderBottomColor="#f0f0f0"
    >
      {/* Empty view for spacing */}
      <View width={24} />

      {/* Center title and progress dots */}
      <YStack alignItems="center" gap="$1.5" maxWidth="80%">
        <Text fontSize={17} fontWeight="600" textAlign="center" color="#000">
          {title}
        </Text>
        <ProgressDots
          currentStep={currentStep}
          totalSteps={totalSteps}
          dotSize={6}
          gap={6}
          visible={displayDots}
        />
      </YStack>

      {/* Close button */}
      <HeaderCloseButton />
    </XStack>
  );
};

export default WizardHeader;
