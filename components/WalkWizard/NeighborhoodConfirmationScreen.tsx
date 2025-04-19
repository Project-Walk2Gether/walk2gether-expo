import { collection, getDocs } from "@react-native-firebase/firestore";
import { Handshake, Pin, Speech, Users } from "@tamagui/lucide-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Text, View, XStack, YStack } from "tamagui";
import { db } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { useWalkForm } from "../../context/WalkFormContext";
import { COLORS } from "../../styles/colors";
import WizardWrapper from "./WizardWrapper";

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
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyWalkers, setNearbyWalkers] = useState(0);
  const [isLoadingNearbyUsers, setIsLoadingNearbyUsers] = useState(false);

  // Default location (central location if permissions are not granted)
  const defaultLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Radius in meters
  const walkRadius = 1500; // 1.5 km radius

  // Function to find nearby users within the radius
  const findNearbyWalkers = async (userLocation: {
    latitude: number;
    longitude: number;
  }) => {
    if (!userLocation) return;

    setIsLoadingNearbyUsers(true);
    try {
      // Query users from Firestore who have location data
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);

      if (usersSnapshot.empty) {
        console.log("No users found");
        setNearbyWalkers(0);
        setIsLoadingNearbyUsers(false);
        return;
      }

      // Filter users by distance
      let nearbyUsersCount = 0;
      usersSnapshot.forEach((doc) => {
        // Skip the current user
        if (doc.id === user?.uid) return;

        const userData = doc.data();
        const userLoc = userData.location;

        // If user has location data
        if (userLoc && userLoc.latitude && userLoc.longitude) {
          const distance = getDistanceInKm(
            userLocation.latitude,
            userLocation.longitude,
            userLoc.latitude,
            userLoc.longitude
          );

          // Count users within radius
          if (distance <= NEARBY_USERS_RADIUS_KM) {
            nearbyUsersCount++;
          }
        }
      });

      setNearbyWalkers(nearbyUsersCount);
      console.log(
        `Found ${nearbyUsersCount} users within ${NEARBY_USERS_RADIUS_KM}km`
      );
    } catch (error) {
      console.error("Error finding nearby users:", error);
    } finally {
      setIsLoadingNearbyUsers(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);

        // Create a location object to match the format expected by the form
        const locationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          name: "Current Location",
          description: "Your current location",
        };

        // Update the form data with the user's current location
        updateFormData({ location: locationData });

        // Find nearby walkers
        await findNearbyWalkers({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Could not get your location");
      }
    })();
  }, []);

  return (
    <WizardWrapper
      onContinue={onSubmit}
      onBack={onBack}
      continueText="Start the walk!"
    >
      <YStack gap="$4">
        <YStack justifyContent="flex-start" gap="$4">
          {/* Map View */}
          <View style={styles.mapContainer}>
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text color="#ff6b6b" fontSize={17} textAlign="center">
                  {errorMsg}
                </Text>
                <Text
                  color="#555"
                  fontSize={14}
                  textAlign="center"
                  marginTop="$2"
                >
                  We need your location to find nearby walkers
                </Text>
              </View>
            ) : (
              <MapView
                provider={
                  Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                }
                style={styles.map}
                region={
                  location
                    ? {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.0121,
                      }
                    : defaultLocation
                }
                showsUserLocation
                showsMyLocationButton
                showsCompass
              >
                {location && (
                  <>
                    <Marker
                      coordinate={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                      }}
                      title="Your Location"
                      pinColor={COLORS.action}
                    />
                    <Circle
                      center={{
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
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
            <View style={styles.mapOverlay}>
              <XStack
                backgroundColor={COLORS.action}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius={10}
                alignItems="center"
                gap="$2"
              >
                <Users size={18} color="white" />
                <Text fontSize={17} fontWeight="600" color="white">
                  {isLoadingNearbyUsers
                    ? "Finding walkers..."
                    : `${nearbyWalkers} walker${
                        nearbyWalkers !== 1 ? "s" : ""
                      } in your neighborhood`}
                </Text>
              </XStack>
            </View>
          </View>

          <View style={styles.card}>
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
                <View style={styles.iconContainer}>
                  <Speech size={19} color="white" />
                </View>
                <Text flexShrink={1} fontSize={17} color="#333">
                  Announce the walk to your neighbors!
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <View style={styles.iconContainer}>
                  <Pin size={19} color="white" />
                </View>
                <Text flexShrink={1} fontSize={17} color="#333">
                  Neighbors can request to join
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <View style={styles.iconContainer}>
                  <Handshake size={19} color="white" />
                </View>
                <Text flexShrink={1} fontSize={17} color="#333">
                  If you accept, your live location will be shared so you can
                  meet up and walk2gether!
                </Text>
              </XStack>
            </YStack>
          </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
  },
  map: {
    width: Dimensions.get("window").width - 32, // Adjust for padding
    height: 220,
  },
  errorContainer: {
    height: 220,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mapOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  iconContainer: {
    backgroundColor: COLORS.action,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NeighborhoodConfirmationScreen;
