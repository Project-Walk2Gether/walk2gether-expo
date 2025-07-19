import LiveWalkMap from "@/components/WalkScreen/components/LiveWalkMap";
import WalkLocationCard from "@/components/WalkScreen/components/WalkLocationCard";
import WalkParticipantStatusControls from "@/components/WalkScreen/components/WalkParticipantStatusControls/index";
import CurrentUserStatusCard from "@/components/WalkScreen/components/CurrentUserStatusCard";
import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { useWalk } from "@/context/WalkContext";
import { COLORS } from "@/styles/colors";
import { useIsFocused } from "@react-navigation/native";
import { Car, ChevronRight, MapPin } from "@tamagui/lucide-icons";
import { differenceInHours } from "date-fns";
import React, { useMemo } from "react";
import { Pressable } from "react-native";
import { Avatar, Text, View, XStack, YStack } from "tamagui";
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

// Helper function to render distance and duration information
const renderDistanceInfo = (participant?: ParticipantWithRoute) => {
  if (!participant?.route?.distance?.text) return null;

  return (
    <YStack alignItems="flex-end" space="$1">
      <Text fontSize="$3" color="$gray11" fontWeight="bold">
        {participant.route.distance.text}
      </Text>
      {participant.route.duration?.text && (
        <Text fontSize="$2" color="$gray9">
          {participant.route.duration.text}
        </Text>
      )}
    </YStack>
  );
};

export default function MapTab() {
  const { walk, participants, currentUserParticipantDoc } = useWalk();
  const { user } = useAuth();
  const { showSheet, hideSheet } = useSheet();

  const isFocussed = useIsFocused();
  console.log({ isFocussed });

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
          showMap={false} // Don't show the map since we're already on the map screen
        />
      </View>

      {/* Current user's participant item - positioned at the bottom, only shown when walk is starting soon */}
      {isStartingSoon && user && walk?.id && currentUserParticipantDoc && (
        <View
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
          }}
        >
          <CurrentUserStatusCard
            participant={currentUserParticipantDoc}
            isOwner={walk.createdByUid === user.uid}
            onPress={() => {
              if (!walk || !user) return;

              showSheet(
                <WalkParticipantStatusControls
                  status={currentUserParticipantDoc.status || "pending"}
                  isCancelled={!!currentUserParticipantDoc.cancelledAt}
                  isOwner={walk.createdByUid === user.uid}
                  walkId={walk.id}
                  userId={user.uid}
                  navigationMethod={currentUserParticipantDoc.navigationMethod || "driving"}
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
        </View>
      )}
    </View>
  );
}
