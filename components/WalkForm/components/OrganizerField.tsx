import React from "react";
import { StyleSheet } from "react-native";
import { Input, Text, YStack } from "tamagui";

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
      <Text style={styles.sectionTitle}>Organizer</Text>
      <Input
        size="$4"
        value={value}
        onChangeText={onChange}
        color={COLORS.text}
        placeholder="Enter organizer name"
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
