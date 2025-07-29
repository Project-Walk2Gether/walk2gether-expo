import RoundsList from "@/components/Rounds/RoundsList";
import { WalkProvider } from "@/context/WalkContext";
import { useDoc } from "@/utils/firestore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Button, View, YStack } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import { X } from "@tamagui/lucide-icons";

export default function WalkRoundsManagementModal() {
  const params = useLocalSearchParams<{ walkId: string }>();
  const walkId = (Array.isArray(params.walkId) ? params.walkId[0] : params.walkId) as string;

  // Get the walk document
  const { doc: walk } = useDoc<Walk>(`walks/${walkId}`);

  const handleClose = () => {
    router.back();
  };
  
  const goBack = () => {
    router.back();
  };

  if (!walk) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Button onPress={handleClose} marginTop="$4">Close</Button>
      </YStack>
    );
  }

  return (
    <View flex={1}>
      <Stack.Screen
        options={{
          title: "Manage Rounds",
          headerRight: () => (
            <Button
              size="$2"
              circular
              icon={<X size={18} />}
              onPress={handleClose}
              backgroundColor="transparent"
            />
          ),
        }}
      />
      
      <WalkProvider
        walk={walk}
        goBack={goBack}
      >
        <YStack flex={1} padding="$4">
          <RoundsList walk={walk as WithId<Walk>} />
        </YStack>
      </WalkProvider>
    </View>
  );
}
