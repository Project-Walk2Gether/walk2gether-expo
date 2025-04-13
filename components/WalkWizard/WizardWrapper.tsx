import { COLORS } from "@/styles/colors";
import React, { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, XStack } from "tamagui";
import { BrandGradient } from "../UI";

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
    <BrandGradient style={styles.container}>
      {/* Content ScrollView */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          // Add bottom padding to ensure content isn't hidden behind the footer
          { paddingBottom: 80 + insets.bottom },
        ]}
      >
        {children}
      </ScrollView>

      {/* Fixed Footer with Buttons */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16), paddingTop: 16 },
        ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default WizardWrapper;
