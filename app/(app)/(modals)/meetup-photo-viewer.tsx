import ImageViewer from "@/components/ImageViewer";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "tamagui";

export default function MeetupPhotoViewer() {
  const { imageUri, isOwner, walkId } = useLocalSearchParams<{
    imageUri: string;
    isOwner: string;
    walkId: string;
  }>();

  // Parse the boolean from string
  const isOwnerBool = isOwner === "true";

  console.log({ imageUri, isOwnerBool, walkId });

  if (!imageUri) {
    return <View flex={1} backgroundColor="black" />;
  }

  return (
    <ImageViewer imageUri={imageUri} isOwner={isOwnerBool} walkId={walkId} />
  );
}
