import { COLORS } from "@/styles/colors";
import React from "react";
import { Button, ButtonProps } from "tamagui";

interface Props {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  flex?: number;
  size?: ButtonProps["size"];
  width?: ButtonProps["width"];
}

export default function PrimaryButton({
  onPress,
  disabled = false,
  children,
  flex,
  width,
  size = "$5",
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
      {children}
    </Button>
  );
}
