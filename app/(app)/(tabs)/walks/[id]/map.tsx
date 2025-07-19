import LiveWalkMap from "@/components/WalkScreen/components/LiveWalkMap";
import StatusUpdateButton from "@/components/WalkScreen/components/StatusUpdateButton";
import WalkLocationCard from "@/components/WalkScreen/components/WalkLocationCard";
import { useWalk } from "@/context/WalkContext";
import React, { useMemo } from "react";
import { Text, View } from "tamagui";
import { differenceInHours } from "date-fns";

export default function MapTab() {
  const { walk, participants, participantDoc } = useWalk();

  // Check if walk is scheduled within the next 5 hours
  const isStartingSoon = useMemo(() => {
    if (!walk?.date) return false;
    
    const walkTime = walk.date.toDate();
    const now = new Date();
    const hoursDifference = differenceInHours(walkTime, now);
    
    // Show button if walk starts within 5 hours (including if it's already started)
    return hoursDifference < 5;
  }, [walk]);

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
      
      {/* Location Card - positioned at the top */}
      <View
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <WalkLocationCard
          location={walk.currentLocation}
          locationName={walk.currentLocation?.name}
          notes={walk.startLocation?.notes}
          showMap={false} // Don't show the map since we're already on the map screen
        />
      </View>

      {/* Status Update Button - positioned at the bottom, only shown when walk is starting soon */}
      {isStartingSoon && (
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
      )}
    </View>
  );
}
