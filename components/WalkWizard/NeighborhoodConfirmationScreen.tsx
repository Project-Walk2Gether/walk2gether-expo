import { COLORS } from "@/styles/colors";
import { Bell, MapPin, StopCircle, Users } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Dimensions, Platform } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Button, Text, View, XStack, YStack } from "tamagui";
import { BrandGradient } from "../UI";

interface NeighborhoodConfirmationProps {
  onSubmit: () => void;
  onBack: () => void;
}

export const NeighborhoodConfirmationScreen: React.FC<
  NeighborhoodConfirmationProps
> = ({ onSubmit, onBack }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [nearbyWalkers, setNearbyWalkers] = useState(5); // Mock data - would be from backend
  
  // Default location (central location if permissions are not granted)
  const defaultLocation = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Radius in meters
  const walkRadius = 1500; // 1.5 km radius

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Could not get your location');
      }
    })();
  }, []);
  return (
    <BrandGradient style={styles.container}>
      <YStack gap="$4" paddingHorizontal="$4" paddingVertical="$4" flex={1}>
        <YStack flex={1} justifyContent="flex-start" gap="$4">
          {/* Map View */}
          <View style={styles.mapContainer}>
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text color="#ff6b6b" fontSize={16} textAlign="center">
                  {errorMsg}
                </Text>
                <Text color="#555" fontSize={14} textAlign="center" marginTop="$2">
                  We need your location to find nearby walkers
                </Text>
              </View>
            ) : (
              <MapView
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                style={styles.map}
                region={location ? {
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                } : defaultLocation}
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
                      strokeColor={COLORS.action + '80'}
                      fillColor={COLORS.action + '20'}
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
                <Text fontSize={16} fontWeight="600" color="white">
                  {nearbyWalkers} walkers in your neighborhood
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
                  <MapPin size="$1.5" color="white" />
                </View>
                <Text flexShrink={1} fontSize={16} color="#333">
                  Share your location with nearby neighbors
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <View style={styles.iconContainer}>
                  <Bell size="$1.5" color="white" />
                </View>
                <Text flexShrink={1} fontSize={16} color="#333">
                  Neighbors in your area get notified about your walk
                </Text>
              </XStack>

              <XStack gap="$3" alignItems="center">
                <View style={styles.iconContainer}>
                  <StopCircle size="$1.5" color="white" />
                </View>
                <Text flexShrink={1} fontSize={16} color="#333">
                  You can stop sharing your location at any time
                </Text>
              </XStack>
            </YStack>
          </View>

          <View style={styles.card}>
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
          </View>
        </YStack>

        <XStack gap="$4" justifyContent="space-between">
          <Button
            size="$5"
            backgroundColor={COLORS.actionSecondary}
            color={COLORS.textOnDark}
            onPress={onBack}
            flex={1}
          >
            Back
          </Button>
          <Button
            size="$5"
            backgroundColor={COLORS.action}
            color={COLORS.textOnDark}
            onPress={onSubmit}
            flex={1}
          >
            Start the walk!
          </Button>
        </XStack>
      </YStack>
    </BrandGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  map: {
    width: Dimensions.get('window').width - 32, // Adjust for padding
    height: 220,
  },
  errorContainer: {
    height: 220,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapOverlay: {
    position: 'absolute',
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
