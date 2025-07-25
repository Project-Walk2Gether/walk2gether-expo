import CurrentUserStatusCard from "@/components/WalkScreen/components/CurrentUserStatusCard";
import LiveWalkMap from "@/components/WalkScreen/components/LiveWalkMap";
import WalkLocationCard from "@/components/WalkScreen/components/WalkLocationCard";
import WalkParticipantStatusControls from "@/components/WalkScreen/components/WalkParticipantStatusControls/index";
import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { useWalk } from "@/context/WalkContext";
import { COLORS } from "@/styles/colors";
import { useIsFocused } from "@react-navigation/native";
import { Car, MapPin } from "@tamagui/lucide-icons";
import { differenceInHours } from "date-fns";
import React, { useMemo } from "react";
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
  const { walk, currentUserParticipantDoc } = useWalk();
  const { user } = useAuth();
  const { showSheet, hideSheet } = useSheet();

  // Check if the current user is the walk owner and has arrived
  const isOwner = walk?.createdByUid === user?.uid;
  const hasArrived = currentUserParticipantDoc?.status === "arrived";
  const showActionSliders = isOwner && hasArrived;

  // Determine if the walk is already in progress based on startedAt field
  const walkInProgress = !!walk?.startedAt;
  const canEndWalk = walkInProgress;

  const isFocussed = useIsFocused();

  // Check if walk is scheduled within the next 5 hours
  const isStartingSoon = useMemo(() => {
    if (!walk?.date) return false;

    const walkTime = walk.date.toDate();
    const now = new Date();
    const hoursDifference = differenceInHours(walkTime, now);

    // Show button if walk starts within 5 hours (including if it's already started)
    return hoursDifference < 5;
  }, [walk]);

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
          showMap={false}
        >
          {isStartingSoon && user && walk?.id && currentUserParticipantDoc && (
            <CurrentUserStatusCard
              participant={currentUserParticipantDoc}
              isOwner={walk.createdByUid === user.uid}
              mt="$2"
              onPress={() => {
                if (!walk || !user) return;

                showSheet(
                  <WalkParticipantStatusControls
                    status={currentUserParticipantDoc.status || "pending"}
                    isCancelled={!!currentUserParticipantDoc.cancelledAt}
                    isOwner={walk.createdByUid === user.uid}
                    walkId={walk.id}
                    userId={user.uid}
                    navigationMethod={
                      currentUserParticipantDoc.navigationMethod || "driving"
                    }
                    onClose={() => {
                      hideSheet();
                    }}
                  />,
                  {
                    title: "Update Your Status",
                    dismissOnSnapToBottom: true,
                  }
                );
              }}
            />
          )}
        </WalkLocationCard>
      </View>

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
