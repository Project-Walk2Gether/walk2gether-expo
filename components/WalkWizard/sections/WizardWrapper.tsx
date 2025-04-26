import React, { ReactNode } from "react";
import { ScrollView as RNScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, View, XStack } from "tamagui";
import { COLORS } from "../../../styles/colors";
import { BrandGradient } from "../../UI";

interface WizardWrapperProps {
  children: ReactNode;
  onContinue: () => void;
  onBack?: () => void;
  continueDisabled?: boolean;
  continueText?: string;
  backText?: string;
}

export const WizardWrapper: React.FC<WizardWrapperProps> = ({
  children,
  onContinue,
  onBack,
  continueDisabled = false,
  continueText = "Continue",
  backText = "Back",
}) => {
  const insets = useSafeAreaInsets();

  return (
    <BrandGradient variant="modern" style={{ flex: 1 }}>
      {/* Content ScrollView */}
      <RNScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingVertical: 16,
          // Add bottom padding to ensure content isn't hidden behind the footer
          paddingBottom: 80 + insets.bottom,
        }}
      >
        {children}
      </RNScrollView>

      {/* Fixed Footer with Buttons */}
      <View
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="rgba(0, 0, 0, 0.05)"
        paddingHorizontal={16}
        paddingBottom={Math.max(insets.bottom, 16)}
        paddingTop={16}
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
      >
        <XStack gap="$4" justifyContent="space-between">
          {onBack ? (
            <Button
              size="$5"
              backgroundColor={COLORS.actionSecondary}
              color={COLORS.textOnDark}
              onPress={onBack}
              flex={1}
            >
              {backText}
            </Button>
          ) : null}
          <Button
            size="$5"
            backgroundColor={continueDisabled ? COLORS.disabled : COLORS.action}
            color={COLORS.textOnDark}
            disabled={continueDisabled}
            onPress={onContinue}
            flex={1}
          >
            {continueText}
          </Button>
        </XStack>
      </View>
    </BrandGradient>
  );
};

export default WizardWrapper;
