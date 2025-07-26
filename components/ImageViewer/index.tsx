import { useMenu } from "@/context/MenuContext";
import { pickImage, uploadMessageAttachments } from "@/utils/imageUpload";
import firestore from "@react-native-firebase/firestore";
import { ImageMinus, ImagePlus, X } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StatusBar } from "react-native";
import { Button, Image, View, YStack } from "tamagui";
import { Attachment } from "walk2gether-shared";

interface Props {
  imageUri: string;
  isOwner?: boolean;
  walkId?: string;
  onImageUpdated?: (attachment: Attachment) => void;
  onImageDeleted?: () => void;
}

export default function ImageViewer({
  imageUri,
  isOwner = false,
  walkId,
  onImageUpdated,
  onImageDeleted,
}: Props) {
  const router = useRouter();
  const { showMenu } = useMenu();

  const handleClose = () => {
    router.back();
  };

  const handleImageChange = async () => {
    if (!walkId) return;

    try {
      const assets = await pickImage("multiple");
      if (assets.length > 0) {
        // Upload the new image
        const attachments = await uploadMessageAttachments(
          assets,
          `walks/${walkId}/meetupSpot`
        );

        if (attachments.length > 0) {
          // Update the walk document with the new photo
          const walkRef = firestore().collection("walks").doc(walkId);
          await walkRef.update({
            meetupSpotPhoto: attachments[0],
          });

          // Callback to update UI
          if (onImageUpdated) {
            onImageUpdated(attachments[0]);
          }

          // Close the viewer after changing
          handleClose();
        }
      }
    } catch (error) {
      console.error("Error changing image:", error);
      Alert.alert("Error", "Failed to change the image");
    }
  };

  const handleDeleteImage = () => {
    if (!walkId) return;

    Alert.alert("Delete Image", "Are you sure you want to delete this image?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const walkRef = firestore().collection("walks").doc(walkId);
            await walkRef.update({
              meetupSpotPhoto: null,
            });

            // Callback to update UI
            if (onImageDeleted) {
              onImageDeleted();
            }

            // Close the viewer after deletion
            handleClose();
          } catch (error) {
            console.error("Error deleting image:", error);
            Alert.alert("Error", "Failed to delete the image");
          }
        },
      },
    ]);
  };

  const handleShowMenu = () => {
    const menuItems = [
      {
        label: "Change Image",
        icon: <ImagePlus size="$1" />,
        onPress: handleImageChange,
      },
      {
        label: "Delete Image",
        icon: <ImageMinus size="$1" />,
        onPress: handleDeleteImage,
      },
    ];

    showMenu("Image Options", menuItems);
  };

  return (
    <YStack flex={1} backgroundColor="black">
      <StatusBar barStyle="light-content" />

      {/* Full screen image */}
      <View flex={1} justifyContent="center" alignItems="center">
        <Image
          source={{ uri: imageUri }}
          width="100%"
          height="100%"
          resizeMode="contain"
        />
      </View>

      {/* Top bar with close button and menu (if owner) */}
      <View
        position="absolute"
        top={0}
        left={0}
        right={0}
        flexDirection="row"
        justifyContent="flex-end"
        padding="$4"
        zIndex={10}
      >
        {isOwner && (
          <Button
            size="$3"
            circular
            icon={<ImagePlus size="$1" color="white" />}
            marginRight="$2"
            backgroundColor="rgba(0,0,0,0.5)"
            onPress={handleShowMenu}
          />
        )}
        <Button
          size="$3"
          circular
          icon={<X size="$1" color="white" />}
          backgroundColor="rgba(0,0,0,0.5)"
          onPress={handleClose}
        />
      </View>
    </YStack>
  );
}
