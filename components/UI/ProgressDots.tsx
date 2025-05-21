import { COLORS } from "@/styles/colors";
import React from "react";
import { View, XStack } from "tamagui";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  dotSize?: number;
  gap?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
  currentStep,
  totalSteps,
  dotSize = 10,
  gap = 8,
  activeColor = COLORS.action,
  inactiveColor = "#D0D0D0",
}) => {
  return (
    <XStack gap={gap} justifyContent="center">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          width={dotSize}
          height={dotSize}
          borderRadius={dotSize / 2}
          backgroundColor={
            index < currentStep
              ? activeColor
              : index === currentStep - 1
              ? activeColor
              : inactiveColor
          }
        />
      ))}
    </XStack>
  );
};

export default ProgressDots;
