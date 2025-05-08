import { COLORS } from "@/styles/colors";
import React from "react";
import { H4, Input, Text, YStack } from "tamagui";

interface NumberOfRotationsFieldProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  touched?: boolean;
}

export default function NumberOfRotationsField({
  value,
  onChange,
  error,
  touched,
}: NumberOfRotationsFieldProps) {
  return (
    <YStack gap="$1">
      <H4 fontSize="$4" fontWeight="bold" marginBottom="$2">
        Number of Rotations
      </H4>
      <Input
        size="$4"
        value={value.toString()}
        onChangeText={(text) => {
          const number = parseInt(text);
          if (!isNaN(number)) {
            onChange(number);
          } else if (text === "") {
            onChange(0);
          }
        }}
        color={COLORS.text}
        keyboardType="number-pad"
        placeholder="Enter number of rotations"
      />
      {error && touched && (
        <Text color="red" fontSize="$2" marginTop="$1">
          {error}
        </Text>
      )}
    </YStack>
  );
}
