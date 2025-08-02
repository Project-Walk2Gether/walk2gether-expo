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
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
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
  showMap?: boolean;
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
  showMap = true,
  meetupSpotPhoto,
  isWalkOwner = false,
  walkId,
  participants = [],
  isStartingSoon = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { showSheet, hideSheet } = useSheet();
  const { user } = useAuth();

  // Filter participants to only show those with valid status
  const validParticipants = participants.filter(
    (p) => p.status && !p.cancelledAt
  );

  function renderParticipantStatusCards() {
    if (!isStartingSoon || validParticipants.length === 0) {
      return null;
    }

    return (
      <YStack gap="$3">
        {/* Header with expand/collapse button */}
        <Button
          size="$3"
          variant="outlined"
          onPress={() => setIsExpanded(!isExpanded)}
          icon={
            isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
          }
        >
          <Text fontSize="$3" fontWeight="600">
            ETA Information ({validParticipants.length})
          </Text>
        </Button>

        {isExpanded && (
          <YStack gap="$2">
            {validParticipants.map((participant) => (
              <ParticipantStatusCard
                key={participant.id}
                participant={participant}
                isOwner={participant.userUid === user?.uid}
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
                      navigationMethod={
                        participant.navigationMethod || "driving"
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
            ))}
          </YStack>
        )}
      </YStack>
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
      <XStack alignItems="flex-start" width="100%" gap="$3" padding="$4">
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
              Meetup Spot
            </Text>
          </XStack>

          {/* Location Info */}
          <YStack gap="$1">
            <Text fontSize="$4" fontWeight="600" color="$gray12">
              {displayName}
            </Text>
            {notes && (
              <Text fontSize="$3" color="$gray10">
                {notes}
              </Text>
            )}
          </YStack>

          {/* Open in Maps Button */}
          {hasCoordinates && (
            <Button
              size="$3"
              onPress={() =>
                openLocationInMaps(latitude, longitude, displayName)
              }
              icon={<Navigation size={16} color="white" />}
              backgroundColor={COLORS.primary}
              color="white"
              alignSelf="flex-start"
            >
              Open in Maps
            </Button>
          )}

          {/* Map Preview - only shown if showMap is true */}
          {hasCoordinates && showMap && (
            <View
              height={180}
              borderRadius={12}
              overflow="hidden"
              borderWidth={1}
              borderColor="$gray4"
            >
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude,
                  longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                toolbarEnabled={false}
              >
                <Marker
                  coordinate={{ latitude, longitude }}
                  title={displayName}
                  description="Meeting point"
                />
              </MapView>
            </View>
          )}
        </YStack>
      </XStack>
      <View padding="$4" paddingTop={0}>
        {renderParticipantStatusCards()}
      </View>
    </Card>
  );
}
