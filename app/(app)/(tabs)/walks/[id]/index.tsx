import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { View } from "tamagui";
import { Participant, Walk } from "walk2gether-shared";
import { useAuth } from "../../../../../context/AuthContext";
import { useDoc } from "../../../../../utils/firestore";

// This component serves as a router for walk screens
// It determines where the user should go based on their permissions
export default function WalkRouter() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  const router = useRouter();

  // Get the participant doc to check if user is approved
  const { doc: participant } = useDoc<Participant>(
    id && user?.uid ? `walks/${id}/participants/${user.uid}` : undefined
  );

  // Handle routing based on user permissions using imperative navigation
  useEffect(() => {
    // Don't navigate while still loading data
    if (!walk || (user && participant === undefined)) {
      return;
    }

    // Determine the appropriate destination based on permissions
    if (
      user?.uid === walk.createdByUid ||
      (participant && participant.approvedAt)
    ) {
      // Walk owner or approved participant - show the walk details
      // Use router.replace with proper typings
      router.replace({
        pathname: "/walks/[id]/show",
        params: { id: id as string },
      });
    } else {
      // Participant with pending request or non-participant - show request page
      // Use router.replace with proper typings
      router.replace({
        pathname: "/walks/[id]/request",
        params: { id: id as string },
      });
    }
  }, [walk, participant, user, id, router]);

  // Show loading indicator while data is loading or during navigation
  return (
    <>
      <Stack.Screen options={{ title: "Loading..." }} />
      <View flex={1} jc="center" ai="center" p={20}>
        <ActivityIndicator size="large" />
      </View>
    </>
  );
}
