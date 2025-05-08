import { COLORS } from "@/styles/colors";
import React from "react";
import { H4, Input, Text, YStack } from "tamagui";

interface OrganizerFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
}

export default function OrganizerField({
  value,
  onChange,
  error,
  touched,
}: OrganizerFieldProps) {
  return (
    <YStack gap="$1">
      <H4 fontSize="$4" fontWeight="bold" marginBottom="$2">
        Organizer
      </H4>
      <Input
        size="$4"
        value={value}
        onChangeText={onChange}
        color={COLORS.text}
        placeholder="Enter organizer name"
      />
      {error && touched && (
        <Text color="red" fontSize="$2" marginTop="$1">
          {error}
        </Text>
      )}
    </YStack>
  );
}
