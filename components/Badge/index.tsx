import React from "react";
import { Text, XStack } from "tamagui";

interface Props {
  label: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function Badge({ 
  label, 
  backgroundColor = "#4BB4E6", 
  textColor = "white" 
}: Props) {
  return (
    <XStack
      backgroundColor={backgroundColor}
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$2"
      alignItems="center"
      justifyContent="center"
    >
      <Text 
        color={textColor} 
        fontSize="$2" 
        fontWeight="bold"
      >
        {label}
      </Text>
    </XStack>
  );
}
