import { COLORS } from "@/styles/colors";
import { openLocationInMaps } from "@/utils/locationUtils";
import { MapPin, Navigation } from "@tamagui/lucide-icons";
import React from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Text, View, YStack } from "tamagui";
import { Location } from "walk2gether-shared";
import WalkDetailsCard from "../WalkDetailsCard";
import WalkDetailsRow from "../WalkDetailsRow";

interface Props {
  location?: Location;
  locationName?: string;
  notes?: string;
  showMap?: boolean;
}

/**
 * Card component that displays walk location information with a map preview
 */
export default function WalkLocationCard({
  location,
  locationName,
  notes,
  showMap = true, // Default to showing the map
}: Props) {
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
      <YStack w="100%" space="$3">
        {/* Location Info */}
        <WalkDetailsRow
          icon={<MapPin />}
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
      </YStack>
    </WalkDetailsCard>
  );
}
