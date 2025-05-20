import { COLORS } from "@/styles/colors";
import React from "react";
import { Text, YStack } from "tamagui";

interface Props {
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
  label?: string;
  required?: boolean;
}

export function FormControl({ error, touched, children, label, required }: Props) {
  const showError = error && touched;
  
  return (
    <YStack width="100%" gap="$2">
      {label && (
        <Text fontWeight="bold" fontSize="$4" color={COLORS.primary}>
          {label}
          {required && <Text color={COLORS.error}> *</Text>}
        </Text>
      )}
      {children}
      {showError && (
        <Text color="$red10" fontSize="$2" alignSelf="flex-start">
          {error}
        </Text>
      )}
    </YStack>
  );
}
