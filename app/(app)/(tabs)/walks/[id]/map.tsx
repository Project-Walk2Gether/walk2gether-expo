import LiveWalkMap from "@/components/WalkScreen/components/LiveWalkMap";
import StatusUpdateButton from "@/components/WalkScreen/components/StatusUpdateButton";
import { useWalk } from "@/context/WalkContext";
import React from "react";
import { Text, View } from "tamagui";

export default function MapTab() {
  const { walk } = useWalk();

  if (!walk || !walk.id) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <View padding="$4">
          <Text fontSize="$5" textAlign="center">
            Loading walk...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LiveWalkMap walkId={walk.id} />

      {/* Status Update Button - positioned at the bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          right: 16,
        }}
      >
        <StatusUpdateButton testID="map-status-button" />
      </View>
    </View>
  );
}
