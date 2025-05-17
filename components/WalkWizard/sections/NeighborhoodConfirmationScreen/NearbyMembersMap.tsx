import { useLocation } from "@/context/LocationContext";
import { COLORS } from "@/styles/colors";
import { getRegionForRadius } from "@/utils/geo";
import React from "react";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Spinner, Text, View, XStack } from "tamagui";
import { Users } from "@tamagui/lucide-icons";

const pluralize = require("pluralize");

interface Props {
  walkRadius: number;
  nearbyWalkers: number;
  isLoadingNearbyUsers: boolean;
}

export const NearbyMembersMap: React.FC<Props> = ({
  walkRadius,
  nearbyWalkers,
  isLoadingNearbyUsers,
}) => {
  const {
    userLocation,
    loading: isLoadingLocation,
    error: locationError,
  } = useLocation();

  // Track if we're ready to display the map
  const isLoading = isLoadingLocation || !userLocation;

  return (
    <>
      <View
        height={220}
        borderRadius={12}
        overflow="hidden"
        backgroundColor="#eef2f3"
      >
        {isLoading ? (
          <View
            flex={1}
            justifyContent="center"
            alignItems="center"
            paddingHorizontal="$3"
          >
            <Spinner size="large" color={COLORS.action} />
            <Text marginTop="$2" textAlign="center">
              Getting your location...
            </Text>
          </View>
        ) : locationError ? (
          <View
            flex={1}
            justifyContent="center"
            alignItems="center"
            paddingHorizontal="$3"
          >
            <Text textAlign="center" color="red">
              {locationError}
            </Text>
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={
              userLocation
                ? getRegionForRadius(
                    userLocation.coords.latitude,
                    userLocation.coords.longitude,
                    walkRadius
                  )
                : undefined
            }
          >
            {userLocation && (
              <>
                <Marker
                  coordinate={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                  }}
                  title="Your Location"
                  pinColor={COLORS.action}
                />
                <Circle
                  center={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                  }}
                  radius={walkRadius}
                  strokeWidth={2}
                  strokeColor={COLORS.action + "80"}
                  fillColor={COLORS.action + "20"}
                />
              </>
            )}
          </MapView>
        )}
      </View>

      <View>
        <XStack
          backgroundColor={COLORS.action}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={10}
          alignItems="center"
          gap="$2"
        >
          <Users size={18} color="white" />
          <Text fontSize={14} fontWeight="600" color="white">
            {isLoadingNearbyUsers
              ? "Finding walkers..."
              : `${pluralize(
                  "Walk2Gether member",
                  nearbyWalkers,
                  true
                )} in your neighborhood`}
          </Text>
        </XStack>
      </View>
    </>
  );
};

export default NearbyMembersMap;
