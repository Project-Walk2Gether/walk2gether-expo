import { COLORS } from "@/styles/colors";
import React from "react";
import { Button, ButtonProps, Spinner, Text, XStack } from "tamagui";

interface Props {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  flex?: number;
  size?: ButtonProps["size"];
  width?: ButtonProps["width"];
  isLoading?: boolean;
}

export default function PrimaryButton({
  onPress,
  disabled = false,
  children,
  flex,
  width,
  size = "$5",
  isLoading = false,
}: Props) {
  return (
    <Button
      size={size}
      backgroundColor={disabled ? COLORS.disabled : COLORS.action}
      color={COLORS.textOnDark}
      disabled={disabled}
      onPress={onPress}
      flex={flex}
      width={width}
    >
      {isLoading ? (
        <XStack gap="$2" justifyContent="center">
          <Spinner size="small" color={COLORS.textOnDark} />
          {typeof children === "string" && (
            <Text color={COLORS.textOnDark}>{children}</Text>
          )}
        </XStack>
      ) : typeof children === "string" ? (
        <Text color={COLORS.textOnDark}>{children}</Text>
      ) : (
        children
      )}
    </Button>
  );
}
