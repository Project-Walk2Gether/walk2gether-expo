import React from "react";
import { Pressable } from "react-native";
import { Text, YStack } from "tamagui";
import { Message as MessageType } from "walk2gether-shared";

interface MessageProps {
  message: MessageType;
  currentUserId: string;
  onLongPress: (message: MessageType) => void;
}

export const formatMessageTime = (timestamp: any) => {
  if (!timestamp || !timestamp.toDate) return "";
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function Message({ message, currentUserId, onLongPress }: MessageProps) {
  const isMe = message.senderId === currentUserId;

  return (
    <Pressable
      key={message.id}
      onLongPress={() => onLongPress(message)}
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
}
