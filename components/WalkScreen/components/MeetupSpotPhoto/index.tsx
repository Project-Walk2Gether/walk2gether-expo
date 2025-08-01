import MediaPickerButton from "@/components/shared/MediaPickerButton";
import { uploadMessageAttachments } from "@/utils/imageUpload";
import firestore from "@react-native-firebase/firestore";
import { ImagePlus } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable } from "react-native";
import { Image, Spinner, View } from "tamagui";
import { Attachment } from "walk2gether-shared";

interface Props {
  photo?: Attachment;
  isWalkOwner: boolean;
  walkId?: string;
}

const SIZE = 96;

/**
 * Component that displays a meetup spot photo or an upload button for walk owners
 */
export default function MeetupSpotPhoto({ photo, isWalkOwner, walkId }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  console.log({ photo });

  const handlePhotoSelected = async (
    assets: ImagePicker.ImagePickerAsset[]
  ) => {
    if (!walkId || !assets.length) return;

    try {
      setIsUploading(true);

      // Upload the image as an attachment
      const attachments = await uploadMessageAttachments(
        [assets[0]], // Just use the first selected image
        `walks/${walkId}/meetupSpot` // Use a more appropriate storage path
      );

      if (attachments.length > 0) {
        // Update the walk document with the new photo
        const walkRef = firestore().collection("walks").doc(walkId);
        await walkRef.update({
          meetupSpotPhoto: attachments[0],
        });
      }
    } catch (error) {
      console.error("Error uploading meetup spot photo:", error);
      Alert.alert("Error", "Failed to upload meetup spot photo");
    } finally {
      setIsUploading(false);
    }
  };

  // If no photo and user is not the owner, don't render anything
  if (!photo && !isWalkOwner) {
    return null;
  }

  // Photo exists, display it
  if (photo?.uri) {
    const router = useRouter();

    const handleViewPhoto = () => {
      if (walkId) {
        router.push({
          pathname: "/(app)/(modals)/meetup-photo-viewer",
          params: {
            isOwner: String(isWalkOwner),
            walkId,
          },
        });
      }
    };

    return (
      <Pressable onPress={handleViewPhoto}>
        <View
          width={SIZE}
          height={SIZE}
          borderRadius={8}
          overflow="hidden"
          borderWidth={1}
          borderColor="$gray4"
        >
          <Image
            source={{ uri: photo.uri }}
            width={SIZE}
            height={SIZE}
            resizeMode="cover"
          />
        </View>
      </Pressable>
    );
  }

  if (!photo) {
    // Only show upload button if user is the walk owner
    if (isWalkOwner && walkId) {
      return (
        <View width={SIZE} height={SIZE} borderRadius="$4" overflow="hidden">
          {isUploading ? (
            <View
              width="100%"
              height="100%"
              backgroundColor="$gray5"
              justifyContent="center"
              alignItems="center"
            >
              <Spinner size="large" color="$blue10" />
            </View>
          ) : (
            <View
              width="100%"
              height="100%"
              backgroundColor="$gray5"
              justifyContent="center"
              alignItems="center"
            >
              <MediaPickerButton
                onMediaSelected={handlePhotoSelected}
                buttonSize="$5"
                customIcon={<ImagePlus size={24} color="$gray9" />}
                menuTitle="Add Meetup Spot Photo"
              />
            </View>
          )}
        </View>
      );
    }

    // Non-owners see an empty placeholder with reduced opacity
    return (
      <View
        width={SIZE}
        height={SIZE}
        borderRadius="$4"
        backgroundColor="$gray3"
        opacity={0.6}
      />
    );
  }

  return null;
}
