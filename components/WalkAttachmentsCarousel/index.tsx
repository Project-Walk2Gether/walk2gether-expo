import { firestore_instance } from "@/config/firebase";
import { useQuery } from "@/utils/firestore";
import {
  collection,
  limit,
  orderBy,
  query,
} from "@react-native-firebase/firestore";
import React, { useMemo, useState } from "react";
import { FlatList, Image, LayoutChangeEvent } from "react-native";
import { Spinner, Text, View, XStack, YStack } from "tamagui";
import {
  Attachment as AttachmentType,
  Message,
  Walk,
  WithId,
} from "walk2gether-shared";

interface WalkAttachmentsCarouselProps {
  walk: WithId<Walk>;
  maxAttachments?: number;
}

const WalkAttachmentsCarousel: React.FC<WalkAttachmentsCarouselProps> = ({
  walk,
  maxAttachments = 10,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselWidth, setCarouselWidth] = useState(0);

  // Query the messages collection for the walk - we'll filter for attachments in the code
  const messagesQuery = walk.id
    ? query(
        collection(firestore_instance, `walks/${walk.id}/messages`),
        orderBy("createdAt", "desc"),
        limit(50) // Get more messages to ensure we have enough with attachments
      )
    : undefined;

  const { docs: messages, status } = useQuery<Message>(messagesQuery);
  const loading = status === "loading";

  // Extract all attachments from the messages
  const attachments = useMemo(() => {
    const allAttachments: (AttachmentType & {
      messageId?: string;
      senderName?: string;
    })[] = [];

    // Filter messages that have attachments
    const messagesWithAttachments = messages.filter(
      (message) => message.attachments && message.attachments.length > 0
    );

    // Process each message with attachments
    for (const message of messagesWithAttachments) {
      // Filter only image type attachments
      const imageAttachments = message.attachments!.filter(
        (attachment) => attachment.type === "image"
      );

      // Add each attachment with a reference to its parent message ID and sender name
      imageAttachments.forEach((attachment) => {
        allAttachments.push({
          ...attachment,
          messageId: message.id,
          senderName: message.senderName,
        });

        // Stop if we've reached the max attachments limit
        if (allAttachments.length >= maxAttachments) {
          return;
        }
      });

      // Break out of the loop if we've reached the limit
      if (allAttachments.length >= maxAttachments) {
        break;
      }
    }

    return allAttachments;
  }, [messages, maxAttachments]);

  // Handle when a user scrolls through images
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const newIndex = Math.floor(contentOffset.x / viewSize.width);
    setActiveIndex(newIndex);
  };

  // If there are no attachments, don't render anything
  if (!loading && attachments.length === 0) {
    return null;
  }

  return (
    <YStack
      width="100%"
      onLayout={(event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setCarouselWidth(width);
      }}
    >
      {loading ? (
        <View height="$12" justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </View>
      ) : (
        <>
          <FlatList
            data={attachments}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToAlignment="center"
            snapToInterval={carouselWidth > 0 ? carouselWidth : undefined}
            decelerationRate="fast"
            style={{ borderTopRightRadius: 14, borderTopLeftRadius: 14 }}
            renderItem={({ item }) => (
              <View style={{ width: carouselWidth, height: 220 }}>
                <Image
                  source={{ uri: item.uri }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderTopLeftRadius: 14,
                    borderTopRightRadius: 14,
                  }}
                  resizeMode="cover"
                />
                {/* Sender Badge */}
                {item.senderName && (
                  <XStack
                    position="absolute"
                    top={12}
                    left={12}
                    backgroundColor="rgba(0,0,0,0.6)"
                    paddingHorizontal={10}
                    paddingVertical={4}
                    borderRadius={12}
                    alignItems="center"
                  >
                    <Text color="white" fontWeight="500" fontSize={13}>
                      From {item.senderName}
                    </Text>
                  </XStack>
                )}
              </View>
            )}
            keyExtractor={(item) =>
              `${item.messageId}-${item.storagePath}` ||
              Math.random().toString()
            }
          />

          {/* Pagination indicators */}
          {attachments.length > 1 && (
            <XStack
              position="absolute"
              bottom={10}
              width="100%"
              justifyContent="center"
              gap={6}
            >
              {attachments.map((_, index) => (
                <View
                  key={index}
                  width="$1.5"
                  height="$1.5"
                  borderRadius="$1"
                  backgroundColor={
                    activeIndex === index
                      ? "rgba(255, 255, 255, 0.9)"
                      : "rgba(255, 255, 255, 0.5)"
                  }
                />
              ))}
            </XStack>
          )}
        </>
      )}
    </YStack>
  );
};

export default WalkAttachmentsCarousel;
