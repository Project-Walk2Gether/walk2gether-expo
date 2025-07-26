import MediaPickerButton from "@/components/shared/MediaPickerButton";
import { COLORS } from "@/styles/colors";
import { uploadMessageAttachments } from "@/utils/imageUpload";
import firestore from "@react-native-firebase/firestore";
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

/**
 * Component that displays a meetup spot photo or an upload button for walk owners
 */
export default function MeetupSpotPhoto({ photo, isWalkOwner, walkId }: Props) {
  const [isUploading, setIsUploading] = useState(false);

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

    const handleImagePress = () => {
      router.push({
        pathname: "/meetup-photo-viewer",
        params: {
          imageUri: photo.uri,
          isOwner: isWalkOwner.toString(),
          walkId: walkId || "",
        },
      });
    };

    return (
      <Pressable onPress={handleImagePress}>
        <View
          width={70}
          height={70}
          borderRadius={8}
          overflow="hidden"
          borderWidth={1}
          borderColor="$gray4"
        >
          <Image
            source={{ uri: photo.uri }}
            width={100}
            height={100}
            resizeMode="cover"
          />
        </View>
      </Pressable>
    );
  }

  // No photo but user is the owner, show upload button
  if (isWalkOwner) {
    return (
      <View
        width={100}
        height={100}
        justifyContent="center"
        alignItems="center"
        backgroundColor="$gray2"
        borderRadius={8}
        borderWidth={1}
        borderColor="$gray4"
      >
        {isUploading ? (
          <Spinner size="large" color={COLORS.primary} />
        ) : (
          <MediaPickerButton
            onMediaSelected={handlePhotoSelected}
            buttonLabel="Add Photo"
            buttonSize="$2"
            menuTitle="Add Meetup Spot Photo"
          />
        )}
      </View>
    );
  }

  return null;
}
