import React from 'react';
import { ActivityIndicator } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, View } from 'tamagui';
import { COLORS } from '@/styles/colors';
import { getRegionForRadius } from '@/utils/geo';
import NearbyWalkersInfo from '@/components/NearbyWalkersInfo';

interface Props {
  mapRef: React.RefObject<MapView>;
  startLocation: {
    latitude: number;
    longitude: number;
    name: string;
  } | null;
  walkType: string;
  walkRadius: number;
  handleMapLongPress: (event: any) => void;
  isReverseGeocoding: boolean;
  longPressActive: boolean;
  locationLoading: boolean;
  locationError: string | null;
  nearbyWalkers: number;
  isLoadingNearbyUsers: boolean;
}

const MapSection: React.FC<Props> = ({
  mapRef,
  startLocation,
  walkType,
  walkRadius,
  handleMapLongPress,
  isReverseGeocoding,
  longPressActive,
  locationLoading,
  locationError,
  nearbyWalkers,
  isLoadingNearbyUsers,
}) => {
  return (
    <View
      flex={1}
      height={300}
      borderRadius={15}
      overflow="hidden"
      position="relative"
    >
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        key={startLocation?.latitude}
        style={{ width: "100%", height: "100%" }}
        initialRegion={
          startLocation
            ? walkType === "neighborhood"
              ? getRegionForRadius(
                  startLocation.latitude,
                  startLocation.longitude,
                  walkRadius
                )
              : {
                  latitude: startLocation.latitude,
                  longitude: startLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }
            : {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
        }
        onLongPress={handleMapLongPress}
      >
        {startLocation && (
          <>
            <Marker
              coordinate={{
                latitude: startLocation.latitude,
                longitude: startLocation.longitude,
              }}
              title={startLocation.name}
              description={startLocation.name}
              pinColor={COLORS.action}
              tracksViewChanges={true} // Performance improvement
            />
            {/* Show circle radius for neighborhood walks */}
            {walkType === "neighborhood" && (
              <Circle
                center={{
                  latitude: startLocation.latitude,
                  longitude: startLocation.longitude,
                }}
                radius={walkRadius}
                strokeWidth={2}
                strokeColor={COLORS.action + "80"}
                fillColor={COLORS.action + "20"}
              />
            )}
          </>
        )}
      </MapView>

      <Text color="white" fontSize={14} fontWeight="500" textAlign="center">
        Tap and hold on the map to choose a location
      </Text>

      {/* Display nearby walkers info for neighborhood walks */}
      {walkType === "neighborhood" && startLocation && (
        <View
          position="absolute"
          bottom={10}
          left={10}
          right={10}
          alignItems="center"
        >
          <NearbyWalkersInfo
            nearbyWalkers={nearbyWalkers}
            isLoadingNearbyUsers={isLoadingNearbyUsers}
          />
        </View>
      )}

      {(isReverseGeocoding || longPressActive || locationLoading) && (
        <View
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor="rgba(255, 255, 255, 0.7)"
          justifyContent="center"
          alignItems="center"
          zIndex={2}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text marginTop={10} color={COLORS.text} fontSize={14}>
            {longPressActive
              ? "Location selected! Getting details..."
              : locationLoading
              ? "Getting your location..."
              : "Getting location details..."}
          </Text>
        </View>
      )}

      {locationError && (
        <View
          backgroundColor="rgba(0, 0, 0, 0.2)"
          justifyContent="center"
          alignItems="center"
          style={{ width: "100%", height: "100%" }}
        >
          <Text
            color={COLORS.textOnDark}
            textAlign="center"
            fontWeight="600"
          >
            {locationError}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MapSection;
