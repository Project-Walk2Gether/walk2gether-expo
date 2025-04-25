import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Walk } from "walk2gether-shared";
import HeaderCloseButton from "../../../../../components/HeaderCloseButton";
import WaitingRoomScreen from "../../../../../components/Walk/WaitingRoomScreen";
import { useDoc } from "../../../../../utils/firestore";

export default function WalkWaitingRoom() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  if (!walk) return null;

  const handleBack = () => {
    if (router.canGoBack()) router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Manage requests",
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <WaitingRoomScreen walk={walk} onBack={handleBack} />
    </>
  );
}
