import { COLORS } from "@/styles/colors";
import React, { ReactNode } from "react";
import { Button, Text } from "tamagui";

interface Props {
  /**
   * Button label text
   */
  label: string;

  /**
   * Function to call when the button is pressed
   */
  onPress?: () => void;

  /**
   * Icon to display in the button
   */
  icon: ReactNode;

  /**
   * Optional size for the button (can be number or string)
   * @default 22
   */
  size?: number | string;

  /**
   * Optional background color
   * @default COLORS.primary
   */
  backgroundColor?: string;

  /**
   * Optional font size for the label
   * @default 12
   */
  fontSize?: number;

  /**
   * Optional font weight for the label
   * @default "500"
   */
  fontWeight?: string;

  /**
   * Optional text color
   * @default "white"
   */
  color?: string;

  /**
   * Optional accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Standardized button component for WalkCard and related components
 */
export const WalkCardButton: React.FC<Props> = ({
  label,
  onPress = () => {}, // Default no-op function when onPress is undefined
  icon,
  size = 22,
  backgroundColor = COLORS.primary,
  fontSize = 12,
  fontWeight = "500",
  color = "white",
}) => {
  return (
    <Button
      size={size}
      onPress={onPress}
      icon={icon}
      backgroundColor={backgroundColor}
    >
      <Text color={color} fontSize={fontSize} fontWeight={fontWeight}>
        {label}
      </Text>
    </Button>
  );
};
