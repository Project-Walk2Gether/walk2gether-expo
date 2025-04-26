import WalkMenu from "components/WalkMenu";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator } from "react-native";
import { View, XStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import HeaderCloseButton from "../../../../../components/HeaderCloseButton";
import ActiveWalkScreen from "../../../../../components/ShowWalkScreen/ActiveWalkScreen";
import FutureWalkScreen from "../../../../../components/ShowWalkScreen/FutureWalkScreen";
import WalkHistoryScreen from "../../../../../components/ShowWalkScreen/WalkHistoryScreen";
import { useDoc } from "../../../../../utils/firestore";
import { isActive, isFuture, isOwner } from "../../../../../utils/walkUtils";

// The walk details display screen
export default function WalkShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const walkId = Array.isArray(id) ? id[0] : id;
  const { doc: walk } = useDoc<Walk>(`walks/${walkId}`);

  // Show loading while walk is loading
  if (!walk) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "",
            headerRight: () => <HeaderCloseButton />,
          }}
        />
        <View flex={1} jc="center" ai="center" p={20}>
          <ActivityIndicator size="large" />
        </View>
      </>
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
          headerRight: () => (
            <XStack gap="$2">
              {isOwner(walk) ? <WalkMenu walk={walk} /> : null}
              <HeaderCloseButton />
            </XStack>
          ),
        }}
      />
      <ScreenComponent walk={walk} />
    </>
  );
}
