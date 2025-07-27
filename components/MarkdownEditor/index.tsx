import {
  MarkdownTextInput,
  parseExpensiMark,
} from "@expensify/react-native-live-markdown";
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
        markdownStyle={markdownStyle}
      />

      {touched && error && (
        <Text color="$red10" fontSize={14}>
          {error}
        </Text>
      )}
    </YStack>
  );
}

const markdownStyle: any = {
  syntax: {
    color: "gray",
  },
  link: {
    color: "blue",
  },
  h1: {
    fontSize: 25,
  },
  emoji: {
    fontSize: 20,
    // fontFamily: FONT_FAMILY_EMOJI,
  },
  blockquote: {
    borderColor: "gray",
    borderWidth: 6,
    marginLeft: 6,
    paddingLeft: 6,
  },
  code: {
    // fontFamily: FONT_FAMILY_MONOSPACE,
    fontSize: 20,
    color: "black",
    backgroundColor: "lightgray",
  },
  pre: {
    // fontFamily: FONT_FAMILY_MONOSPACE,
    fontSize: 20,
    color: "black",
    backgroundColor: "lightgray",
  },
  mentionHere: {
    color: "green",
    backgroundColor: "lime",
  },
  mentionUser: {
    color: "blue",
    backgroundColor: "cyan",
  },
};
