import { useAuth } from "@/context/AuthContext";
import { useSheet } from "@/context/SheetContext";
import { COLORS } from "@/styles/colors";
import { openLocationInMaps } from "@/utils/locationUtils";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Navigation,
} from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Button, Card, Text, View, XStack, YStack } from "tamagui";
import {
  Attachment,
  Location,
  ParticipantWithRoute,
  WithId,
} from "walk2gether-shared";
import MeetupSpotPhoto from "../MeetupSpotPhoto";
import ParticipantStatusCard from "../ParticipantStatusCard";
import WalkParticipantStatusControls from "../WalkParticipantStatusControls";

interface Props {
  location?: Location;
  locationName?: string;
  notes?: string;
  meetupSpotPhoto?: Attachment;
  isWalkOwner?: boolean;
  walkId?: string;
  participants?: WithId<ParticipantWithRoute>[];
  isStartingSoon?: boolean;
}

/**
 * Card component that displays meetup spot information with participant status cards
 */
export default function MeetupSpotCard({
  location,
  locationName,
  notes,
  meetupSpotPhoto,
  isWalkOwner = false,
  walkId,
  participants = [],
  isStartingSoon = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { showSheet, hideSheet } = useSheet();
  const { user } = useAuth();

  // Filter participants to only show those with valid status
  const validParticipants = participants.filter(
    (p) => p.status && !p.cancelledAt
  );

  function renderParticipantStatusCards() {
    if (!isStartingSoon || validParticipants.length === 0 || !isExpanded) {
      return null;
    }

    return (
      <View padding="$4" paddingTop={0}>
        <YStack gap="$2">
          {validParticipants.map((participant) => (
            <ParticipantStatusCard
              key={participant.id}
              participant={participant}
              isMe={participant.userUid === user?.uid}
              onPress={() => {
                if (!walkId || !user || participant.userUid !== user.uid)
                  return;

                showSheet(
                  <WalkParticipantStatusControls
                    status={participant.status || "pending"}
                    isCancelled={!!participant.cancelledAt}
                    isOwner={participant.userUid === user.uid}
                    walkId={walkId}
                    userId={user.uid}
                    navigationMethod={participant.navigationMethod || "driving"}
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
          ))}
        </YStack>
      </View>
    );
  }

  // If there's no location data, show a placeholder
  if (!location || !location.latitude || !location.longitude) {
    return (
      <Card
        backgroundColor="white"
        elevate
        borderRadius="$4"
        testID="meetup-spot-card"
      >
        <YStack padding="$4" gap="$3">
          <XStack alignItems="center" gap="$2">
            <MapPin size={16} color="$gray10" />
            <Text fontSize="$4" fontWeight="bold" color="$gray12">
              Meetup Spot
            </Text>
          </XStack>
          <Text>Location not specified</Text>
        </YStack>
      </Card>
    );
  }

  // Extract location data for easier access
  const { latitude, longitude } = location;
  const displayName = locationName || "Meeting point";
  const hasCoordinates = Boolean(latitude && longitude);

  return (
    <Card
      backgroundColor="white"
      elevate
      borderRadius="$4"
      testID="meetup-spot-card"
    >
      <XStack alignItems="center" width="100%" gap="$3" padding="$4">
        <MeetupSpotPhoto
          photo={meetupSpotPhoto}
          isWalkOwner={isWalkOwner}
          walkId={walkId}
        />
        <YStack flex={1} gap="$2">
          {/* Header with Meetup Spot title */}
          <XStack alignItems="center" gap="$2">
            <MapPin size={16} color="$gray10" />
            <Text fontSize="$4" fontWeight="bold" color="$gray12">
              {displayName}
            </Text>
          </XStack>

          {/* Location Info */}
          <YStack gap="$1">
            {notes && (
              <Text fontSize="$3" color="$gray10">
                {notes}
              </Text>
            )}
          </YStack>

          {/* Action Buttons Row */}
          <XStack gap="$2" alignItems="center">
            {/* Open in Maps Button */}
            {hasCoordinates && (
              <Button
                size="$2"
                onPress={() =>
                  openLocationInMaps(latitude, longitude, displayName)
                }
                icon={<Navigation size={16} color="white" />}
                backgroundColor={COLORS.primary}
                color="white"
                flex={1}
              >
                Open in Maps
              </Button>
            )}

            {/* ETA Toggle Button */}
            {isStartingSoon && validParticipants.length > 0 && (
              <Button
                size="$2"
                variant="outlined"
                onPress={() => setIsExpanded(!isExpanded)}
                icon={
                  isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )
                }
                width={44}
                padding={0}
              />
            )}
          </XStack>
        </YStack>
      </XStack>
      {renderParticipantStatusCards()}
    </Card>
  );
}
