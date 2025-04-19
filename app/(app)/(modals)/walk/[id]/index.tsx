import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { View } from "tamagui";
import { Walk } from "walk2gether-shared";
import HeaderCloseButton from "../../../../../components/HeaderCloseButton";
import WaitingRoomButton from "../../../../../components/WaitingRoomButton";
import ActiveWalkScreen from "../../../../../components/Walk/ActiveWalkScreen";
import FutureWalkScreen from "../../../../../components/Walk/FutureWalkScreen";
import WalkHistoryScreen from "../../../../../components/Walk/WalkHistoryScreen";
import { useAuth } from "../../../../../context/AuthContext";
import { useWaitingParticipants } from "../../../../../hooks/useWaitingParticipants";
import { useDoc } from "../../../../../utils/firestore";
import { isActive, isFuture } from "../../../../../utils/walkUtils";

// Main content component that handles the walk state and displays the appropriate screen.
export default function WalkScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  const { user } = useAuth();
  const waitingParticipants = useWaitingParticipants(id);

  // Show loading while walk is loading
  if (!walk) {
    return (
      <View flex={1} jc="center" ai="center" p={20}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show the correct screen based on the walk state
  const ScreenComponent = isActive(walk)
    ? ActiveWalkScreen
    : isFuture(walk)
    ? FutureWalkScreen
    : WalkHistoryScreen;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Let's walk!",
          headerLeft: () =>
            walk.createdByUid === user!.uid && (
              <WaitingRoomButton
                id={id}
                pendingRequests={waitingParticipants}
              />
            ),
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <ScreenComponent walk={walk} />
    </>
  );
}
