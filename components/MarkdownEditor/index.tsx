import { MarkdownTextInput, parseExpensiMark } from "@expensify/react-native-live-markdown";
import React from "react";
import { Text, YStack } from "tamagui";

interface Props {
  value: string;
  onChange: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  touched?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  label = "",
  placeholder = "Add details using markdown...",
  error,
  touched,
}: Props) {
  return (
    <YStack space="$2">
      {label && (
        <Text fontWeight="bold" fontSize={16}>
          {label}
        </Text>
      )}
      
      <MarkdownTextInput
        value={value || ""}
        onChangeText={onChange}
        parser={parseExpensiMark}
        placeholder={placeholder}
        style={{ minHeight: 150 }}
      />
      
      {touched && error && (
        <Text color="$red10" fontSize={14}>
          {error}
        </Text>
      )}
    </YStack>
  );
}
