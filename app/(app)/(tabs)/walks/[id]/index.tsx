import { useAuth } from "@/context/AuthContext";
import { useDoc } from "@/utils/firestore";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { View } from "tamagui";
import { Participant, Walk } from "walk2gether-shared";

// This component serves as a router for walk screens
// It determines where the user should go based on their permissions
export default function WalkRouter() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);

  // Get the participant doc to check if user is approved
  const { doc: participant } = useDoc<Participant>(
    id && user?.uid ? `walks/${id}/participants/${user.uid}` : undefined
  );

  // Determine if we have all the data needed to make routing decisions
  const isLoading = !walk || (user && participant === undefined);

  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View flex={1} jc="center" ai="center" p={20}>
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  // Determine the appropriate destination based on permissions
  if (
    user?.uid === walk.createdByUid ||
    (participant && participant.acceptedAt && !participant.rejectedAt)
  ) {
    // Walk owner or approved participant - show the walk details
    return <Redirect href={`/walks/${id}/show`} />;
  } else {
    // Participant with pending/rejected request or non-participant - show request page
    return <Redirect href={`/walks/${id}/request`} />;
  }
}
