import { COLORS } from "@/styles/colors";
import { openLocationInMaps } from "@/utils/locationUtils";
import { MapPin, MonitorSmartphone, Navigation } from "@tamagui/lucide-icons";
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Text, View, XStack, YStack } from "tamagui";
import { Attachment, Location } from "walk2gether-shared";
import MeetupSpotPhoto from "../MeetupSpotPhoto";
import WalkDetailsCard from "../WalkDetailsCard";
import WalkDetailsRow from "../WalkDetailsRow";

interface Props {
  location?: Location;
  locationName?: string;
  notes?: string;
  showMap?: boolean;
  children?: React.ReactNode;
  meetupSpotPhoto?: Attachment;
  isWalkOwner?: boolean;
  walkId?: string;
  isVirtual?: boolean;
}

/**
 * Card component that displays walk location information with a map preview
 */
export default function WalkLocationCard({
  location,
  locationName,
  notes,
  showMap = true, // Default to showing the map
  children,
  meetupSpotPhoto,
  isWalkOwner = false,
  walkId,
  isVirtual = false,
}: Props) {
  // If it's a virtual walk, show a virtual meeting card
  if (isVirtual) {
    return (
      <WalkDetailsCard title="Virtual Walk" testID="walk-location-card">
        <XStack alignItems="center" width="100%" gap="$2">
          <YStack flex={1} gap="$3">
            <WalkDetailsRow
              icon={<MonitorSmartphone color={COLORS.walkTypes.virtual.main} />}
              label="Connect virtually from anywhere"
              sublabel={notes || "Join using the video chat button when the walk starts"}
              testID="walk-virtual-row"
            />
            {children}
          </YStack>
        </XStack>
      </WalkDetailsCard>
    );
  }

  // If there's no location data, show a placeholder
  if (!location || !location.latitude || !location.longitude) {
    return (
      <WalkDetailsCard title="Meeting Point" testID="walk-location-card">
        <Text>Location not specified</Text>
      </WalkDetailsCard>
    );
  }

  // Extract location data for easier access
  const { latitude, longitude } = location;
  const displayName = locationName || "Meeting point";
  const hasCoordinates = Boolean(latitude && longitude);

  // Define the header action button if coordinates are available
  const headerAction = hasCoordinates ? (
    <Button
      size="$2"
      onPress={() => openLocationInMaps(latitude, longitude, displayName)}
      icon={<Navigation size={14} color="white" />}
      backgroundColor={COLORS.primary}
      color="white"
    >
      Open in Maps
    </Button>
  ) : undefined;

  return (
    <WalkDetailsCard
      title="Meeting Point"
      testID="walk-location-card"
      headerAction={headerAction}
    >
      <XStack alignItems="center" width="100%" gap="$2">
        <MeetupSpotPhoto
          photo={meetupSpotPhoto}
          isWalkOwner={isWalkOwner}
          walkId={walkId}
        />
        <YStack flex={1} gap="$3">
          {/* Location Info */}
          <WalkDetailsRow
            icon={meetupSpotPhoto ? null : <MapPin />}
            label={displayName}
            sublabel={notes}
            testID="walk-location-row"
          />

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

          {/* No need for Navigate button here as it's moved to the header */}
          {children}
        </YStack>
      </XStack>
    </WalkDetailsCard>
  );
}
