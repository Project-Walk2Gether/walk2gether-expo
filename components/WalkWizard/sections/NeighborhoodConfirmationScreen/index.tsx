import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { Handshake, Pin, Speech, Users } from "@tamagui/lucide-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Card, Spinner, Text, View, XStack, YStack } from "tamagui";
import WizardWrapper from "../WizardWrapper";
import { findNearbyWalkers } from "./findNearbyWalkers";

const pluralize = require("pluralize");

interface NeighborhoodConfirmationProps {
  onSubmit: () => void;
  onBack: () => void;
}

// Maximum radius in kilometers for finding nearby walkers
const NEARBY_USERS_RADIUS_KM = 5;

/**
 * Calculates the distance between two geo points using the haversine formula
 */
const getDistanceInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const NeighborhoodConfirmationScreen: React.FC<
  NeighborhoodConfirmationProps
> = ({ onSubmit, onBack }) => {
  const { updateFormData } = useWalkForm();
  const { user } = useAuth();
  const { userLocation, loading: isLoadingLocation, error: locationError } = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyWalkers, setNearbyWalkers] = useState(0);
  const [nearbyWalkerIds, setNearbyWalkerIds] = useState<string[]>([]);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);
  
  // Track if we're ready to display the screen
  const isLoading = isLoadingLocation || !userLocation;

  // Radius in meters
  const walkRadius = 1500; // 1.5 km radius

  // Function to find nearby users within the radius
  const handleFindNearbyWalkers = async (userLocation: {
    latitude: number;
    longitude: number;
  }) => {
    const nearbyIds = await findNearbyWalkers({
      user,
      userLocation,
      radiusKm: NEARBY_USERS_RADIUS_KM,
      getDistanceInKm,
      setNearbyWalkers,
      setIsLoadingNearbyUsers,
    });
    
    // Store the nearby walker IDs
    setNearbyWalkerIds(nearbyIds);
    
    // Update the form data with nearby user IDs
    updateFormData({
      nearbyUserIds: nearbyIds
    });
  };

  useEffect(() => {
    if (userLocation && !isLoadingLocation) {
      // Create a location object to match the format expected by the form
      const locationData = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        name: "Current Location",
        description: "Your current location",
      };

      // Update the form data with the user's current location
      updateFormData({ location: locationData });

      // Find nearby walkers when location is available
      handleFindNearbyWalkers({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
    } else if (locationError) {
      setErrorMsg(locationError);
    }
  }, [userLocation, isLoadingLocation, locationError]);

  // Handle submit - notification functionality will be handled server-side
  const handleSubmit = () => {
    // Continue with the normal submission - notifications are handled in Firebase Functions
    onSubmit();
  };

  return (
    <WizardWrapper
      onContinue={handleSubmit}
      onBack={onBack}
      continueText="Start the walk!"
    >
      <YStack gap="$4">
        <YStack justifyContent="flex-start" gap="$4">
          {/* Map View */}
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
            ) : errorMsg ? (
              <View
                flex={1}
                justifyContent="center"
                alignItems="center"
                paddingHorizontal="$3"
              >
                <Text textAlign="center" color="red">
                  {errorMsg}
                </Text>
              </View>
            ) : (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={userLocation ? {
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                } : undefined}
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
                    )} in the area`}
              </Text>
            </XStack>
          </View>

          <Card
            backgroundColor="white"
            borderRadius={12}
            padding="$4"
            marginBottom="$2"
          >
            <Text
              fontSize={16}
              fontWeight="600"
              color={COLORS.text}
              marginBottom="$3"
            >
              How it works:
            </Text>

            <YStack gap="$4">
              <XStack gap="$3" alignItems="center">
                <View
                  backgroundColor={COLORS.action}
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Speech size={19} color="white" />
                </View>
                <Text flexShrink={1} fontSize={17} color="#333">
                  Announce the walk to your neighbors!
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <View
                  backgroundColor={COLORS.action}
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Pin size={19} color="white" />
                </View>
                <Text flexShrink={1} fontSize={17} color="#333">
                  Neighbors can request to join within the next 20 minutes.
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <View
                  backgroundColor={COLORS.action}
                  width={32}
                  height={32}
                  borderRadius={16}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Handshake size={19} color="white" />
                </View>
                <Text flexShrink={1} fontSize={17} color="#333">
                  If you accept, your live location will be shared so you can
                  meet up and walk2gether!
                </Text>
              </XStack>
            </YStack>
          </Card>

          {/* <View style={styles.card}>
            <Text
              fontSize={16}
              fontWeight="600"
              color={COLORS.text}
              marginBottom="$2"
            >
              Ready to walk?
            </Text>
            <Text fontSize={14} color="#555">
              Your walk will begin right now. Other neighbors can see your
              location and join you on your walk.
            </Text>
          </View> */}
        </YStack>
      </YStack>
    </WizardWrapper>
  );
};

export default NeighborhoodConfirmationScreen;
