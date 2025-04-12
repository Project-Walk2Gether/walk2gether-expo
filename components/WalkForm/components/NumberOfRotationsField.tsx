import React from "react";
import { StyleSheet } from "react-native";
import { Input, Text, YStack } from "tamagui";

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
      <Text style={styles.sectionTitle}>Number of Rotations</Text>
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
      {error && touched && <Text style={styles.errorText}>{error}</Text>}
    </YStack>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
