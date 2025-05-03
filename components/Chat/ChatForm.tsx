import { Send } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Button, Input, XStack } from "tamagui";
import { COLORS } from "../../styles/colors";

type ChatFormProps = {
  onSendMessage: (message: string) => void;
  keyboardVerticalOffset?: number;
  containerStyle?: any;
};

export default function ChatForm({
  onSendMessage,
  keyboardVerticalOffset = 200,
  containerStyle = {},
}: ChatFormProps) {
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText("");
  };

  return (
    <KeyboardAvoidingView
      style={[containerStyle]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={
        Platform.OS === "ios" ? keyboardVerticalOffset : 0
      }
    >
      <XStack
        backgroundColor="white"
        padding="$3"
        pt={0}
        alignItems="center"
        gap="$2"
        // borderTopWidth={1}
        // borderTopColor="#eee"
      >
        <Input
          flex={1}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          backgroundColor="white"
          borderWidth={1}
          borderColor="#e0e0e0"
          borderRadius="$4"
          autoCapitalize="none"
          color={COLORS.text}
          paddingHorizontal="$3"
          paddingVertical="$2"
          onSubmitEditing={handleSendMessage}
        />
        <Button
          size="$4"
          circular
          backgroundColor="#4EB1BA"
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
          icon={<Send size="$1" color="white" />}
          opacity={!messageText.trim() ? 0.5 : 1}
        />
      </XStack>
    </KeyboardAvoidingView>
  );
}
