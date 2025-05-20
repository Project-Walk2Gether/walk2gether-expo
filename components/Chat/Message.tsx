import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import { Attachment, Message as MessageType } from "walk2gether-shared";

interface Props {
  message: MessageType;
  currentUserId: string;
  onLongPress: (message: MessageType) => void;
}

export const formatMessageTime = (timestamp: any) => {
  if (!timestamp || !timestamp.toDate) return "";
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_IMAGE_WIDTH = SCREEN_WIDTH * 0.6; // 60% of screen width
const THUMBNAIL_HEIGHT = 200; // Fixed height for thumbnails in the horizontal list
const SINGLE_IMAGE_HEIGHT = 200; // Max height for single images

// Helper function to calculate image dimensions for display
const calculateImageDimensions = (
  attachment: Attachment,
  isThumbnail = false
) => {
  // If we don't have metadata, use some reasonable defaults
  if (!attachment.metadata?.width || !attachment.metadata?.height) {
    return isThumbnail
      ? { width: THUMBNAIL_HEIGHT, height: THUMBNAIL_HEIGHT }
      : { width: MAX_IMAGE_WIDTH, height: SINGLE_IMAGE_HEIGHT };
  }

  const aspectRatio = attachment.metadata.width / attachment.metadata.height;

  if (isThumbnail) {
    // For thumbnails in a horizontal list, use fixed height and calculate width
    let height = THUMBNAIL_HEIGHT;
    let width = height * aspectRatio;

    // Don't let thumbnails get too wide or too narrow
    if (width > THUMBNAIL_HEIGHT * 1.5) width = THUMBNAIL_HEIGHT * 1.5;
    if (width < THUMBNAIL_HEIGHT * 0.7) width = THUMBNAIL_HEIGHT * 0.7;

    return { width, height };
  } else {
    // For single images, respect max width and calculate height
    let width = Math.min(attachment.metadata.width, MAX_IMAGE_WIDTH);
    let height = width / aspectRatio;

    // Don't let the image get too tall
    if (height > SINGLE_IMAGE_HEIGHT) {
      height = SINGLE_IMAGE_HEIGHT;
      width = height * aspectRatio;
    }

    return { width, height };
  }
};

export default function Message({
  message,
  currentUserId,
  onLongPress,
}: Props) {
  const isMe = message.senderId === currentUserId;
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasText = message.message && message.message.trim().length > 0;

  // Handle image tap to navigate to gallery
  const handleImagePress = (attachment: Attachment, index: number) => {
    if (!message.walkId || !message.id) return;

    router.push({
      pathname: "/(app)/(modals)/gallery" as const,
      params: {
        walkId: message.walkId,
        messageId: message.id,
        selectedIndex: index.toString(),
      },
    });
  };

  return (
    <>
      <Pressable
        key={message.id}
        onLongPress={() => onLongPress(message)}
        delayLongPress={500}
      >
        <XStack alignSelf={isMe ? "flex-end" : "flex-start"}>
          <YStack
            backgroundColor={isMe ? "#4EB1BA" : "#eee"}
            paddingHorizontal={hasAttachments ? "$2" : "$4"}
            paddingVertical={hasAttachments ? "$2" : "$3"}
            borderRadius="$4"
            maxWidth="80%"
            marginBottom="$3"
            overflow="hidden"
          >
            {/* Display attachments if present */}
            {hasAttachments && message.attachments && (
              <YStack overflow="hidden">
                {message.attachments.length === 1 ? (
                  // Single image
                  <YStack>
                    {message.attachments.map((attachment, index) => {
                      if (attachment.type === "image") {
                        const { width, height } = calculateImageDimensions(
                          attachment,
                          false
                        );
                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleImagePress(attachment, index)}
                          >
                            <Image
                              source={{ uri: attachment.uri }}
                              width={width}
                              height={height}
                              borderRadius="$2"
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return null;
                    })}
                  </YStack>
                ) : (
                  // Multiple images in a horizontal FlatList
                  <FlatList
                    data={message.attachments.filter(
                      (att) => att.type === "image"
                    )}
                    keyExtractor={(_, index) => `image-${index}`}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 0 }}
                    ItemSeparatorComponent={() => <XStack width={8} />}
                    renderItem={({ item: attachment }) => (
                      <TouchableOpacity
                        onPress={() =>
                          handleImagePress(
                            attachment,
                            message.attachments
                              ? message.attachments.findIndex(
                                  (a) => a.uri === attachment.uri
                                )
                              : 0
                          )
                        }
                      >
                        {(() => {
                          const { width, height } = calculateImageDimensions(
                            attachment,
                            true
                          );
                          return (
                            <Image
                              source={{ uri: attachment.uri }}
                              width={width}
                              height={height}
                              borderRadius="$2"
                            />
                          );
                        })()}
                      </TouchableOpacity>
                    )}
                  />
                )}
              </YStack>
            )}

            {/* Display sender name for messages from others */}
            {!isMe && (
              <Text
                fontSize="$2"
                fontWeight="bold"
                color="#555"
                mb="$1"
                px={hasAttachments ? "$2" : "$0"}
              >
                {message.senderName || "Unknown"}
              </Text>
            )}

            {/* Display message text if present */}
            {hasText && (
              <Text
                color={isMe ? "white" : "black"}
                px={hasAttachments ? "$2" : "$0"}
              >
                {message.message}
              </Text>
            )}

            {/* Display message timestamp */}
            <Text
              fontSize="$2"
              color={isMe ? "rgba(255,255,255,0.8)" : "#888"}
              alignSelf="flex-end"
              px={hasAttachments ? "$2" : "$0"}
              mt="$1"
            >
              {message.createdAt
                ? formatMessageTime(message.createdAt)
                : "Sending..."}
            </Text>
          </YStack>
        </XStack>
      </Pressable>
    </>
  );
}
