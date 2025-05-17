import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { getRegionForRadius } from "@/utils/geo";
import { Handshake, Pin, Speech, Users } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Card, H4, Spinner, Text, View, XStack, YStack } from "tamagui";
import WizardWrapper from "../WizardWrapper";
import { findNearbyWalkers } from "./findNearbyWalkers";

const pluralize = require("pluralize");

interface NeighborhoodConfirmationProps {
  onSubmit: () => void;
  onBack: () => void;
}

// Radius in meters
const walkRadius = 700;

export const NeighborhoodConfirmationScreen: React.FC<
  NeighborhoodConfirmationProps
> = ({ onSubmit, onBack }) => {
  const { updateFormData } = useWalkForm();
  const { user } = useAuth();
  const {
    userLocation,
    loading: isLoadingLocation,
    error: locationError,
  } = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyWalkers, setNearbyWalkers] = useState(0);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);

  // Track if we're ready to display the screen
  const isLoading = isLoadingLocation || !userLocation;

  // Function to find nearby users within the radius
  const handleFindNearbyWalkers = async (userLocation: {
    latitude: number;
    longitude: number;
  }) => {
    const nearbyIds = await findNearbyWalkers({
      user,
      userLocation,
      radiusKm: walkRadius / 1000,
      setNearbyWalkers,
      setIsLoadingNearbyUsers,
    });

    // Update the form data with nearby user IDs
    updateFormData({
      invitedUserIds: nearbyIds,
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
      updateFormData({ startLocation: locationData });

      // Find nearby walkers when location is available
      handleFindNearbyWalkers({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
    } else if (locationError) {
      setErrorMsg(locationError);
    }
  }, [userLocation, isLoadingLocation, locationError]);

  return (
    <WizardWrapper
      onContinue={onSubmit}
      onBack={onBack}
      continueText="I am all set!"
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

          <Card
            backgroundColor="white"
            borderRadius={12}
            padding="$4"
            marginBottom="$2"
          >
            <H4 textAlign="center" marginBottom="$2">
              How it works
            </H4>

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
                  Start a walk in your neighborhood and nearby Walk2Gether
                  members will be notified.
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
                  Neighbors have 20 minutes to request to join your walk.
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
                  If you accept, you'll share live locations to meet up and
                  walk2gether!
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
