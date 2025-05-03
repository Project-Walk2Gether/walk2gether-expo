import { Send } from "@tamagui/lucide-icons";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { COLORS } from "../../styles/colors";
import { useAuth } from "../../context/AuthContext";
import { MessageOptionsSheet } from "./MessageOptionsSheet";

type Props = {
  messages: Message[];
  loading?: boolean;
  onSendMessage: (message: string) => void;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  keyboardVerticalOffset?: number;
  containerStyle?: any;
  headerTitle?: React.ReactNode;
};

export default function WalkChat({
  messages,
  loading = false,
  onSendMessage,
  onDeleteMessage,
  keyboardVerticalOffset = 140,
  containerStyle = {},
  headerTitle,
}: Props) {
  const { user } = useAuth();
  const scrollViewRef = useRef<RNScrollView | null>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
  
  // Handle long press on message
  const handleLongPress = (message: Message) => {
    setSelectedMessage(message);
    setOptionsSheetOpen(true);
  };
  
  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (onDeleteMessage) {
      await onDeleteMessage(messageId);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText("");
  };

  // Format timestamp for display
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Render individual message
  const renderMessage = (message: Message) => {
    const isMe = message.senderId === user?.uid;

    return (
      <Pressable
        key={message.id}
        onLongPress={() => handleLongPress(message)}
        delayLongPress={500}
      >
        <YStack
          alignSelf={isMe ? "flex-end" : "flex-start"}
          backgroundColor={isMe ? "#4EB1BA" : "#eee"}
          paddingHorizontal="$4"
          paddingVertical="$3"
          borderRadius="$4"
          maxWidth="80%"
          marginBottom="$3"
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
      </Pressable>
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
      
      {/* Message options sheet */}
      <MessageOptionsSheet
        open={optionsSheetOpen}
        onOpenChange={setOptionsSheetOpen}
        selectedMessage={selectedMessage}
        onDeleteMessage={handleDeleteMessage}
      />
    </KeyboardAvoidingView>
  );
}
