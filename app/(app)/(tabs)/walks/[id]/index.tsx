import { useAuth } from "@/context/AuthContext";
import { useDoc } from "@/utils/firestore";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { View } from "tamagui";
import { Participant, Walk } from "walk2gether-shared";
import { addHours } from "date-fns";

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

  // Check if the walk is more than 3 hours in the future
  const isUpcoming = walk.date ? new Date() < addHours(new Date(), -3) && new Date() < walk.date.toDate() : false;

  // Determine the appropriate destination based on permissions and timing
  if (
    user?.uid === walk.createdByUid ||
    (participant && participant.acceptedAt && !participant.deniedAt)
  ) {
    // Walk owner or approved participant
    if (walk.date && walk.date.toDate() > addHours(new Date(), 3)) {
      // If the walk is more than 3 hours in the future, show the upcoming screen
      return <Redirect href={`/walks/upcoming/details?id=${id}`} />;
    } else {
      // Otherwise show the active walk details
      return <Redirect href={`/walks/${id}/show`} />;
    }
  } else {
    // Participant with pending/rejected request or non-participant - show request page
    return <Redirect href={`/walks/${id}/view-invitation`} />;
  }
}
