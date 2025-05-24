import React, { ReactNode } from "react";
import { Text, XStack } from "tamagui";

interface Props {
  /**
   * The icon component to display
   */
  icon: React.ReactElement;

  /**
   * Text content to display next to the icon
   */
  text: string | React.ReactNode;

  /**
   * Optional number of lines for text truncation
   */
  numberOfLines?: number;

  /**
   * Content to display after the text (like a button or badge)
   */
  afterContent?: ReactNode;

  /**
   * Content to display on the right side of the row (pushed to the far right)
   */
  right?: React.ReactElement;

  /**
   * Text color to use
   */
  color?: string;
  
  /**
   * Text color to use specifically for the text (overrides color)
   */
  textColor?: string;
  
  /**
   * Font weight for the text
   */
  textWeight?: string;

  /**
   * Handler for when the row is pressed
   */
  onPress?: () => void;
}

/**
 * A reusable component that displays an icon followed by text in a row
 */
export const IconTextRow: React.FC<Props> = ({
  icon,
  text,
  afterContent,
  right,
  numberOfLines,
  color = "#555",
  textColor,
  textWeight = "400",
  onPress,
}) => {
  return (
    <XStack alignItems="center" gap="$2" minHeight={30} onPress={onPress}>
      <XStack alignItems="center" gap="$2" flex={right ? 1 : undefined}>
        {icon}
        <Text
          fontSize={14}
          fontWeight={textWeight}
          color={textColor || color}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail"
          flex={numberOfLines && !afterContent ? 1 : undefined}
        >
          {text}
        </Text>
        {afterContent}
      </XStack>
      {right}
    </XStack>
  );
};
