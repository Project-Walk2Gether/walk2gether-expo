import QuoteWithImage from "@/components/QuoteWithImage";
import React from "react";
import { YStack } from "tamagui";
import WizardWrapper from "./WizardWrapper";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export const QuoteSection: React.FC<Props> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  return (
    <WizardWrapper
      onContinue={onContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueText="Finish"
    >
      <YStack gap="$4" alignItems="center" paddingHorizontal="$4">
        <QuoteWithImage imageSize={250} skipAnimation={true} />
      </YStack>
    </WizardWrapper>
  );
};

export default QuoteSection;
