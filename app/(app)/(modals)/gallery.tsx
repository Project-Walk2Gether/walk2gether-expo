import { db } from "@/config/firebase";
import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import {
  collectionGroup,
  orderBy,
  query,
  where,
} from "@react-native-firebase/firestore";
import { ChevronLeft, ChevronRight, X } from "@tamagui/lucide-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { Dimensions, FlatList } from "react-native";
import { Button, Image, Spinner, Text, View, XStack, YStack } from "tamagui";
import { Attachment, Message } from "walk2gether-shared";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function GalleryScreen() {
  const params = useLocalSearchParams();
  const walkId = params.walkId as string;
  const messageId = params.messageId as string;
  const initialSelectedIndex = parseInt(
    (params.selectedIndex as string) || "0",
    10
  );

  console.log({ walkId });

  // Reference to the FlatList for scrolling
  const galleryListRef = useRef<FlatList>(null);

  // Use a collectionGroup query to get all messages for this walkId
  const messagesQuery = query(
    collectionGroup(db, "messages"),
    where("walkId", "==", walkId),
    orderBy("createdAt", "desc")
  );

  const { docs: messages, status } = useQuery<Message>(messagesQuery);

  // Extract all image attachments from messages using flatMap
  const allImages = useMemo(() => {
    return messages.flatMap((message) => {
      if (!message.attachments?.length) return [];

      return message.attachments.filter(
        (attachment) => attachment.type === "image"
      );
    });
  }, [messages]);

  // Always use all images from the walk
  const displayImages = allImages;

  // Calculate the global index to scroll to when all images are loaded
  const calculatedScrollIndex = useMemo(() => {
    if (!messageId || initialSelectedIndex === undefined) return 0;

    let globalIndex = 0;
    // Find the specified message
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex === -1) return 0;

    // Count all attachment images in messages before the target message
    for (let i = 0; i < messageIndex; i++) {
      const msg = messages[i];
      if (msg.attachments) {
        globalIndex += msg.attachments.filter(
          (att) => att.type === "image"
        ).length;
      }
    }

    // Add the index of the specific attachment in the target message
    const targetMessage = messages[messageIndex];
    const imageAttachments =
      targetMessage.attachments?.filter((att) => att.type === "image") || [];
    return (
      globalIndex + Math.min(initialSelectedIndex, imageAttachments.length - 1)
    );
  }, [messages, messageId, initialSelectedIndex]);

  // Once images are loaded, scroll to the calculated index
  useEffect(() => {
    if (displayImages.length > 0 && galleryListRef.current) {
      // Use a small timeout to ensure the list is rendered
      setTimeout(() => {
        galleryListRef.current?.scrollToIndex({
          index: Math.min(calculatedScrollIndex, displayImages.length - 1),
          animated: false,
          viewPosition: 0.5,
        });
      }, 100);
    }
  }, [displayImages, calculatedScrollIndex]);

  // Go back to walk screen
  const handleClose = () => {
    router.back();
  };

  // Navigate to previous image
  const goToPreviousImage = (currentIndex: number) => {
    if (currentIndex > 0 && galleryListRef.current) {
      galleryListRef.current.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  // Navigate to next image
  const goToNextImage = (currentIndex: number) => {
    if (currentIndex < displayImages.length - 1 && galleryListRef.current) {
      galleryListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  // Handle scroll error (out of bounds index)
  const handleScrollToIndexFailed = () => {
    if (galleryListRef.current) {
      setTimeout(() => {
        // Try with the first item if initial index is problematic
        galleryListRef.current?.scrollToIndex({
          index: 0,
          animated: false,
        });
      }, 100);
    }
  };

  const renderImageItem = ({
    item,
    index,
  }: {
    item: Attachment;
    index: number;
  }) => (
    <View
      width={SCREEN_WIDTH}
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Image
        source={{ uri: item.uri }}
        width="100%"
        height="90%"
        resizeMode="contain"
      />

      {/* Navigation controls */}
      <XStack
        position="absolute"
        bottom={80}
        width="100%"
        justifyContent="space-between"
        paddingHorizontal="$5"
      >
        <Button
          size="$6"
          circular
          opacity={index > 0 ? 0.8 : 0.3}
          backgroundColor="rgba(0,0,0,0.5)"
          disabled={index === 0}
          onPress={() => goToPreviousImage(index)}
          icon={<ChevronLeft color="white" size="$2" />}
        />

        <Button
          size="$6"
          circular
          opacity={index < displayImages.length - 1 ? 0.8 : 0.3}
          backgroundColor="rgba(0,0,0,0.5)"
          disabled={index === displayImages.length - 1}
          onPress={() => goToNextImage(index)}
          icon={<ChevronRight color="white" size="$2" />}
        />
      </XStack>

      {/* Image counter display */}
      <XStack
        position="absolute"
        bottom={20}
        width="100%"
        justifyContent="center"
      >
        <YStack
          backgroundColor="rgba(0,0,0,0.5)"
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius="$2"
        >
          <Text color="white" fontSize="$3">
            {index + 1} / {displayImages.length}
          </Text>
        </YStack>
      </XStack>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />

      <View flex={1} backgroundColor="black">
        {/* Close button */}
        <Button
          position="absolute"
          top={60}
          right={20}
          size="$5"
          circular
          zIndex={1000}
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={handleClose}
          icon={<X color="white" size="$2" />}
        />

        {status === "loading" ? (
          <View flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="white" />
            <Text fontSize="$3" color="white" marginTop="$3">
              Loading images...
            </Text>
          </View>
        ) : displayImages.length === 0 ? (
          <View
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding="$4"
          >
            <Text fontSize="$4" textAlign="center" color="white">
              No images found.
            </Text>
            <Button
              marginTop="$6"
              onPress={handleClose}
              backgroundColor={COLORS.primary}
            >
              Go Back
            </Button>
          </View>
        ) : (
          <FlatList
            ref={galleryListRef}
            data={displayImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollToIndexFailed={handleScrollToIndexFailed}
          />
        )}
      </View>
    </>
  );
}
