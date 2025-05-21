import React, { ReactNode } from "react";
import { Text, XStack } from "tamagui";

interface Props {
  /**
   * The icon component to display
   */
  icon: ReactNode;
  
  /**
   * Text content to display next to the icon
   */
  text: ReactNode;
  
  /**
   * Optional gap between icon and text
   * @default "$1.5"
   */
  gap?: string | number;
  
  /**
   * Optional text style props
   */
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  
  /**
   * Optional number of lines for text truncation
   */
  numberOfLines?: number;
  
  /**
   * Optional ellipsis mode for text truncation
   */
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  
  /**
   * Optional flex value for the XStack
   */
  flex?: number;
  
  /**
   * Optional additional props to pass to the XStack
   */
  xStackProps?: React.ComponentProps<typeof XStack>;
  
  /**
   * Optional additional props to pass to the Text component
   */
  textProps?: React.ComponentProps<typeof Text>;
}

/**
 * A reusable component that displays an icon followed by text in a row
 */
export const IconTextRow: React.FC<Props> = ({
  icon,
  text,
  gap = "$1.5",
  fontSize = 14,
  fontWeight = "400",
  color = "$gray12",
  numberOfLines,
  ellipsizeMode,
  flex,
  xStackProps,
  textProps,
}) => {
  return (
    <XStack 
      alignItems="center" 
      gap={gap} 
      flex={flex}
      {...xStackProps}
    >
      {icon}
      <Text
        fontSize={fontSize}
        fontWeight={fontWeight}
        color={color}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        flex={numberOfLines ? 1 : undefined}
        {...textProps}
      >
        {text}
      </Text>
    </XStack>
  );
};
