import React from "react";
import { H1, Text, View, XStack } from "tamagui";

/**
 * Standardized screen title component for consistent headers across the app
 */
interface ScreenTitleProps {
  children: React.ReactNode;
  color?: string;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const ScreenTitle: React.FC<ScreenTitleProps> = ({
  children,
  color = "#333333", // Default to dark text
  leftAction,
  rightAction,
}) => {
  return (
    <XStack 
      justifyContent="space-between"
      alignItems="center"
      marginBottom="$5"
    >
      {leftAction && (
        <View marginRight="$2">{leftAction}</View>
      )}
      <H1 
        fontSize="$8" 
        fontWeight="bold"
        flex={1}
        color={color}
      >
        {children}
      </H1>
      {rightAction && (
        <View marginLeft="$2">{rightAction}</View>
      )}
    </XStack>
  );
};

