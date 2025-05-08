import React, { useEffect, useState } from "react";
import { FlatList, Modal, TouchableOpacity, Dimensions } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import firestore, { collection, query, orderBy } from "@react-native-firebase/firestore";
import { X } from "@tamagui/lucide-icons";
import { Button, Image, Text, YStack, XStack, Stack as TamaguiStack, Spinner } from "tamagui";
import { Attachment, Message } from "walk2gether-shared";
import { useQuery } from "../../../../../utils/firestore";
import { firestore_instance } from "../../../../../config/firebase";
import HeaderBackButton from "../../../../../components/HeaderBackButton";
import { COLORS } from "../../../../../styles/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const ITEM_SIZE = SCREEN_WIDTH / NUM_COLUMNS;
const SPACING = 2;

export default function WalkGalleryScreen() {
  const params = useLocalSearchParams();
  const walkId = params.id as string;
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);
  const [allImages, setAllImages] = useState<Attachment[]>([]);

  // Query messages for this specific walk
  const messagesRef = collection(firestore(), `walks/${walkId}/messages`);
  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "desc")
  );

  const { docs: messages, status } = useQuery<Message>(messagesQuery);

  // Extract all image attachments from messages
  useEffect(() => {
    if (messages.length > 0) {
      const images: Attachment[] = [];
      
      messages.forEach(message => {
        if (message.attachments && message.attachments.length > 0) {
          message.attachments.forEach(attachment => {
            if (attachment.type === "image") {
              images.push(attachment);
            }
          });
        }
      });
      
      setAllImages(images);
    }
  }, [messages]);

  // Handle image tap to show full-screen preview
  const handleImagePress = (image: Attachment) => {
    setSelectedImage(image);
  };

  // Close the image preview modal
  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  const renderImageItem = ({ item }: { item: Attachment }) => (
    <TouchableOpacity 
      onPress={() => handleImagePress(item)}
      style={{
        width: ITEM_SIZE - SPACING * 2,
        height: ITEM_SIZE - SPACING * 2,
        margin: SPACING,
      }}
    >
      <Image
        source={{ uri: item.uri }}
        width="100%"
        height="100%"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Walk Gallery",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      
      <YStack flex={1} backgroundColor="white">
        {status === "loading" ? (
          <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color={COLORS.primary} />
            <Text fontSize="$3" color={COLORS.text} marginTop="$3">
              Loading images...
            </Text>
          </YStack>
        ) : allImages.length === 0 ? (
          <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
            <Text fontSize="$4" textAlign="center" color={COLORS.text}>
              No images have been shared in this walk yet.
            </Text>
          </YStack>
        ) : (
          <FlatList
            data={allImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{ padding: SPACING }}
          />
        )}
      </YStack>

      {/* Full-screen image preview modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade" onRequestClose={closeImagePreview}>
        <TamaguiStack flex={1} backgroundColor="rgba(0,0,0,0.9)" justifyContent="center" alignItems="center">
          {selectedImage && (
            <>
              <Image
                source={{ uri: selectedImage.uri }}
                width="100%"
                height="80%"
                resizeMode="contain"
              />
              <XStack position="absolute" top={0} width="100%" padding="$4" justifyContent="space-between" alignItems="center">
                <Text color="white" fontSize="$4" fontWeight="bold">
                  {selectedImage.metadata?.width && selectedImage.metadata?.height
                    ? `${selectedImage.metadata.width} × ${selectedImage.metadata.height}`
                    : ""}
                </Text>
                <Button
                  size="$4"
                  circular
                  backgroundColor="rgba(0,0,0,0.5)"
                  onPress={closeImagePreview}
                  icon={<X color="white" />}
                />
              </XStack>
            </>
          )}
        </TamaguiStack>
      </Modal>
    </>
  );
}
