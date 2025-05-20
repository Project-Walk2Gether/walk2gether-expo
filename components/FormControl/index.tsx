import { COLORS } from "@/styles/colors";
import React from "react";
import { Text, XStack, YStack } from "tamagui";

interface Props {
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
  label?: string;
  required?: boolean;
  action?: React.ReactNode;
  description?: string;
}

export function FormControl({ 
  error, 
  touched, 
  children, 
  label, 
  required, 
  action,
  description 
}: Props) {
  const showError = error && touched;
  
  return (
    <YStack width="100%" gap="$2">
      {(label || action) && (
        <XStack width="100%" ai="center" jc="space-between">
          {label && (
            <Text fontWeight="bold" fontSize="$4" color={COLORS.primary}>
              {label}
              {required && <Text color={COLORS.error}> *</Text>}
            </Text>
          )}
          {action}
        </XStack>
      )}
      {description && (
        <Text color="$gray10" fontSize="$3">
          {description}
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
