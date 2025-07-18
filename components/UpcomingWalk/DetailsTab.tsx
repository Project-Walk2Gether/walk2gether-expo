import React from "react";
import { ScrollView } from "react-native";
import { Text, View, YStack } from "tamagui";
import { useWalk } from "@/context/WalkContext";
import WalkInfo from "@/components/WalkInfo";
import { COLORS } from "@/styles/colors";
import { addHours } from "date-fns";
import { formatDistanceToNow } from "date-fns";

export default function DetailsTab() {
  const { walk } = useWalk();
  
  if (!walk) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Walk information not available</Text>
      </View>
    );
  }

  // Calculate time until the walk
  const walkTime = walk.date ? walk.date.toDate() : null;
  const timeUntil = walkTime ? formatDistanceToNow(walkTime, { addSuffix: true }) : "unknown time";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
      <YStack p="$4" space="$4">
        <View 
          backgroundColor="$blue2" 
          p="$4" 
          borderRadius="$4" 
          borderWidth={1} 
          borderColor="$blue4"
        >
          <Text fontSize="$5" fontWeight="bold" color={COLORS.action} mb="$2">
            Upcoming Walk
          </Text>
          <Text fontSize="$4" mb="$2">
            Starts {timeUntil}
          </Text>
          <Text fontSize="$3" color="$gray11">
            You'll be able to see real-time updates and location information when the walk begins.
          </Text>
        </View>

        <WalkInfo walk={walk} />
        
        {walk.description ? (
          <YStack space="$2">
            <Text fontSize="$4" fontWeight="bold">
              Description
            </Text>
            <Text fontSize="$3" color="$gray11">
              {walk.description}
            </Text>
          </YStack>
        ) : null}
      </YStack>
    </ScrollView>
  );
}
