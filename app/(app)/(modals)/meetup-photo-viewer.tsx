import ImageViewer from "@/components/ImageViewer";
import { useDoc } from "@/utils/firestore";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Spinner, View } from "tamagui";
import { Walk } from "walk2gether-shared";

export default function MeetupPhotoViewer() {
  const { isOwner, walkId } = useLocalSearchParams<{
    isOwner: string;
    walkId: string;
  }>();

  // Parse the boolean from string
  const isOwnerBool = isOwner === "true";

  // Fetch the walk document using the walkId
  const { doc: walk, status } = useDoc<Walk>(walkId ? `walks/${walkId}` : undefined);

  console.log({ walk, isOwnerBool, walkId });

  // Show loading spinner while the document is loading
  if (status === "loading") {
    return (
      <View flex={1} backgroundColor="black" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue10" />
      </View>
    );
  }

  // Make sure we have the walk and the meetupSpotPhoto
  if (!walk || !walk.meetupSpotPhoto || !walk.meetupSpotPhoto.uri) {
    return <View flex={1} backgroundColor="black" />;
  }

  return (
    <ImageViewer 
      imageUri={walk.meetupSpotPhoto.uri} 
      isOwner={isOwnerBool} 
      walkId={walkId} 
    />
  );
}
