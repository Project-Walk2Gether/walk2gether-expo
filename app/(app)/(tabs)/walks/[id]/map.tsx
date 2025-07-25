import LiveWalkMap from "@/components/WalkScreen/components/LiveWalkMap";
import { useWalk } from "@/context/WalkContext";
import { COLORS } from "@/styles/colors";
import { useIsFocused } from "@react-navigation/native";
import { Car, MapPin } from "@tamagui/lucide-icons";
import React from "react";
import { Text, View, XStack } from "tamagui";
import { ParticipantWithRoute } from "walk2gether-shared";

// Helper function to render the status information based on participant status
const renderStatusInfo = (participant?: ParticipantWithRoute) => {
  if (!participant) return null;

  let icon = null;
  let label = "Not on the way yet";
  let color = "$gray10";

  if (participant.status === "on-the-way") {
    icon = <Car size={16} color={COLORS.primary} />;
    label = "On the way";
    color = COLORS.primary;
  } else if (participant.status === "arrived") {
    icon = <MapPin size={16} color="$blue9" />;
    label = "Arrived";
    color = "$blue9";
  }

  return (
    <XStack alignItems="center" space="$1">
      {icon}
      <Text fontSize="$3" color={color}>
        {label}
      </Text>
    </XStack>
  );
};

export default function MapTab() {
  const { walk } = useWalk();
  const isFocussed = useIsFocused();

  if (!walk || !isFocussed || !walk.id) {
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

      {/* Walk Action Sliders - only shown when user is owner and has arrived */}
      {/* {showActionSliders && (
        <WalkActionSliders
          showStartWalkSlider={!walkInProgress}
          showEndWalkSlider={canEndWalk}
          onStartWalk={async () => {
            if (!walk?.id) return;

            try {
              await updateDoc(walk._ref as any, {
                startedAt: Timestamp.now(),
              });

              showMessage("Walk started! Enjoy your walk.", "success");
            } catch (error) {
              console.error("Error starting walk:", error);
              showMessage("Failed to start walk. Please try again.", "error");
            }
          }}
          onEndWalk={async () => {
            if (!walk?.id) return;

            try {
              await updateDoc(walk._ref as any, {
                endedAt: Timestamp.now(),
              });

              showMessage("Walk completed! Thanks for joining.", "success");
            } catch (error) {
              console.error("Error ending walk:", error);
              showMessage("Failed to end walk. Please try again.", "error");
            }
          }}
        />
      )} */}
    </View>
  );
}
