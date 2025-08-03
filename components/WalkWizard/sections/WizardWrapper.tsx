import PrimaryButton from "@/components/PrimaryButton";
import { COLORS } from "@/styles/colors";
import React, {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useRef,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView as RNScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, View, XStack } from "tamagui";
import { BrandGradient } from "../../UI";

// Export the handle interface so it can be imported by other components
export interface WizardWrapperHandle {
  scrollToEnd: () => void;
}

interface WizardWrapperProps {
  children: ReactNode;
  onContinue: () => void;
  onBack?: () => void;
  continueDisabled?: boolean;
  continueText?: string;
  backText?: string;
  hideFooter?: boolean;
  currentStep?: number;
  totalSteps?: number;
  isLoading?: boolean;
}

// Create the component with forwardRef
const WizardWrapper = forwardRef<WizardWrapperHandle, WizardWrapperProps>(
  (props, ref) => {
    const {
      children,
      onContinue,
      onBack,
      continueDisabled = false,
      continueText = "Continue",
      backText = "Back",
      hideFooter = false,
      isLoading = false,
    } = props;

    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<RNScrollView>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      scrollToEnd: () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      },
    }));

    // Calculate footer height for keyboard offset
    const FOOTER_HEIGHT = hideFooter ? 0 : 56; // Height of the buttons area
    const keyboardOffset = FOOTER_HEIGHT + insets.bottom;

    return (
      <BrandGradient variant="modern" style={{ flex: 1 }}>
        {/* KeyboardAvoidingView to handle keyboard properly */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={keyboardOffset}
        >
          {/* Content ScrollView */}
          <RNScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              flexGrow: 1,
              paddingVertical: 16,
              // Add bottom padding to ensure content isn't hidden behind the footer
              paddingBottom: 80 + insets.bottom,
            }}
          >
            {/* Progress dots moved to header */}
            {children}
          </RNScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Footer with Buttons */}
        {!hideFooter && (
          <View
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            backgroundColor={COLORS.background}
            paddingHorizontal={16}
            paddingBottom={Math.max(insets.bottom, 16)}
            paddingTop={16}
            borderTopLeftRadius={16}
            borderTopRightRadius={16}
          >
            <XStack gap="$4" justifyContent="space-between">
              {onBack ? (
                <Button size="$5" onPress={onBack} flex={1}>
                  {backText}
                </Button>
              ) : null}
              <PrimaryButton
                onPress={onContinue}
                disabled={continueDisabled}
                flex={1}
                size="$5"
                isLoading={isLoading}
              >
                {continueText}
              </PrimaryButton>
            </XStack>
          </View>
        )}
      </BrandGradient>
    );
  }
);

export default WizardWrapper;
