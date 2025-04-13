import { COLORS } from "@/styles/colors";
import { Send } from "@tamagui/lucide-icons";
import { Timestamp } from "firebase/firestore";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView as RNScrollView,
} from "react-native";
import {
  Button,
  Input,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { Message } from "walk2gether-shared";

type WalkChatProps = {
  messages: Message[];
  loading?: boolean;
  currentUserId: string;
  onSendMessage: (message: string) => void;
  keyboardVerticalOffset?: number;
  containerStyle?: any;
};

export default function WalkChat({
  messages,
  loading = false,
  currentUserId,
  onSendMessage,
  keyboardVerticalOffset = 90,
  containerStyle = {},
}: WalkChatProps) {
  const scrollViewRef = useRef<RNScrollView | null>(null);
  const [messageText, setMessageText] = useState("");

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText("");
  };

  // Format timestamp for display
  const formatMessageTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Render individual message
  const renderMessage = (message: Message) => {
    const isMe = message.senderId === currentUserId;

    return (
      <YStack
        key={message.id}
        alignSelf={isMe ? "flex-end" : "flex-start"}
        backgroundColor={isMe ? "#4EB1BA" : "#eee"}
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderRadius="$4"
        maxWidth="80%"
        marginBottom="$2"
      >
        <Text color={isMe ? "white" : "black"}>{message.message}</Text>
        <Text
          fontSize="$2"
          color={isMe ? "rgba(255,255,255,0.8)" : "#888"}
          alignSelf="flex-end"
        >
          {message.createdAt
            ? formatMessageTime(message.createdAt)
            : "Sending..."}
        </Text>
      </YStack>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, containerStyle]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={
        Platform.OS === "ios" ? keyboardVerticalOffset : 0
      }
    >
      <YStack flex={1} backgroundColor="#F5F5F5">
        {loading ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="#4EB1BA" />
            <Text marginTop="$4" color="#666">
              Loading messages...
            </Text>
          </YStack>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            flex={1}
            padding="$4"
            contentContainerStyle={{ paddingTop: 10 }}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: false })
            }
          >
            {messages.length === 0 ? (
              <YStack height={200} justifyContent="center" alignItems="center">
                <Text color="#666" textAlign="center">
                  No messages yet. Say hello!
                </Text>
              </YStack>
            ) : (
              messages.map(renderMessage)
            )}
          </ScrollView>
        )}

        <XStack
          backgroundColor="white"
          padding="$3"
          alignItems="center"
          gap="$2"
          borderTopWidth={1}
          borderTopColor="#eee"
        >
          <Input
            flex={1}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            backgroundColor="#f0f0f0"
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
      </YStack>
    </KeyboardAvoidingView>
  );
}
