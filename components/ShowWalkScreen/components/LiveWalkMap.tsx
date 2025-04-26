import { doc, setDoc, updateDoc } from "@react-native-firebase/firestore";
import * as BackgroundFetch from "expo-background-fetch";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import { Participant, ParticipantWithRoute, Route } from "walk2gether-shared";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, Platform, Pressable } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Button, Text, View, XStack, YStack } from "tamagui";
import { firestore_instance } from "../../../config/firebase";
import { useAuth } from "../../../context/AuthContext";
import { useWalkParticipants } from "../../../hooks/useWaitingParticipants";
import { COLORS } from "../../../styles/colors";
import { getDirectionsUrl } from "../../../utils/routeUtils";

// Define a task name for background location tracking
const LOCATION_TRACKING_TASK = "background-location-tracking";

// Declare global types for background tracking
declare global {
  var currentUser: any;
  var currentWalkId: string;
}

interface Props {
  walkId: string;
}

// Define the background task for location tracking
TaskManager.defineTask(
  LOCATION_TRACKING_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<any>) => {
    if (error) {
      console.error("Background location error:", error);
      return;
    }
    if (data) {
      // Extract location data
      const { locations } = data as { locations: Location.LocationObject[] };
      const location = locations[0];

      // Get the current user and walk ID from storage
      // We use global variables since task manager runs outside React context
      const currentUser = (global as any).currentUser;
      const currentWalkId = (global as any).currentWalkId;

      if (currentUser && currentWalkId) {
        try {
          // Update the location in Firestore
          const participantDocRef = doc(
            firestore_instance,
            `walks/${currentWalkId}/participants/${currentUser.uid}`
          );
          await updateDoc(participantDocRef, {
            lastLocation: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().getTime(),
            },
          });
          return BackgroundFetch.BackgroundFetchResult.NewData;
        } catch (err) {
          console.error("Error updating location in background:", err);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  }
);

export default function LiveWalkMap({ walkId }: Props) {
  const { user } = useAuth();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [backgroundLocationPermission, setBackgroundLocationPermission] =
    useState<boolean | null>(null);
  const [locationTracking, setLocationTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const mapRef = useRef<MapView>(null);

  const participants = useWalkParticipants(walkId);
  // Store user and walkId in global scope for background tasks
  useEffect(() => {
    if (user && walkId) {
      // Using global as a storage for background tasks
      (global as any).currentUser = user;
      (global as any).currentWalkId = walkId;
    }
  }, [user, walkId]);

  // Monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Request location permissions and start tracking
  useEffect(() => {
    const requestPermissionsAndStartTracking = async () => {
      // Request foreground permission first
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      setLocationPermission(foregroundStatus === "granted");

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Location Permission",
          "We need your location to show you on the map. Please enable location services for this app in your settings."
        );
        return;
      }

      // Request background permission
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      setBackgroundLocationPermission(backgroundStatus === "granted");

      if (backgroundStatus !== "granted") {
        Alert.alert(
          "Background Location Permission",
          "For best experience, please allow background location tracking. This lets us update your position even when the app is closed.",
          [
            { text: "Continue Anyway", style: "cancel" },
            {
              text: "Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  // On iOS we can open the app settings directly
                  Linking.openURL("app-settings:");
                } else {
                  // On Android we can't directly open location settings, so we open app settings
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        // Continue with foreground tracking only
      }

      // Get initial location
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        setUserLocation(location);
        updateUserLocation(location);
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert(
          "Location Error",
          "Could not get your current location. Please check your device settings."
        );
      }

      // Start location tracking based on permissions
      await startLocationTracking();
    };

    requestPermissionsAndStartTracking();

    return () => {
      // Clean up and stop tracking when component unmounts
      stopLocationTracking();
    };
  }, [walkId, user?.uid]);

  // Start location tracking based on permissions
  const startLocationTracking = async () => {
    // Stop any existing tracking first
    await stopLocationTracking();

    if (backgroundLocationPermission) {
      // Start background location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000, // Update every 15 seconds to save battery
        distanceInterval: 10, // Update if moved by 10 meters
        deferredUpdatesInterval: 30000, // 30 seconds
        deferredUpdatesDistance: 50, // 50 meters
        foregroundService: {
          notificationTitle: "Walk Tracking",
          notificationBody: "Your location is being tracked for your walk",
          notificationColor: COLORS.primary,
        },
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Fitness,
        showsBackgroundLocationIndicator: true,
      });
      setLocationTracking(true);
    } else {
      // Fallback to foreground tracking if background permissions not granted
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (location) => {
          setUserLocation(location);
          updateUserLocation(location);
        }
      );

      // Store the subscription for cleanup
      // @ts-ignore - Type issue with Location subscription
      setLocationSubscription(subscription);
    }
  };

  // Stop location tracking
  const stopLocationTracking = async () => {
    // Stop background tracking if it's running
    if (await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING_TASK)) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
    }

    // Stop foreground tracking if it's running
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    setLocationTracking(false);
  };

  // Update user's location in Firestore and calculate route
  const updateUserLocation = async (location: Location.LocationObject) => {
    if (!user || !walkId) return;

    try {
      // Update the user's location in Firestore
      const participantDocRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${user.uid}`
      );
      await setDoc(
        participantDocRef,
        {
          lastLocation: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().getTime(),
          },
          displayName: user.displayName || "Anonymous",
          photoURL: user.photoURL || null,
        },
        { merge: true }
      );
      
      // Route calculation is now handled by Firebase Functions
      // The backend will calculate the route when location changes
    } catch (error) {
      console.error("Error updating user location:", error);
    }
  };

  // Render location permission denied message
  if (locationPermission === false) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text color="red" marginBottom={16} textAlign="center">
          Location permission is required to participate in the walk.
        </Text>
        <Button onPress={() => Location.requestForegroundPermissionsAsync()}>
          Grant Permission
        </Button>
      </View>
    );
  }

  // Show tracking status indicator if needed
  const renderTrackingStatus = () => {
    if (appState !== "active") return null; // Only show in active state

    return (
      <XStack
        position="absolute"
        top={10}
        left={10}
        backgroundColor="rgba(255,255,255,0.8)"
        paddingHorizontal={10}
        paddingVertical={5}
        borderRadius={15}
        alignItems="center"
        zIndex={999}
      >
        <View
          width={8}
          height={8}
          borderRadius={4}
          marginRight={6}
          backgroundColor={locationTracking ? "#4caf50" : "#ff9800"}
        />
        <Text fontSize="$2" color={locationTracking ? "#4caf50" : "#ff9800"}>
          {locationTracking
            ? backgroundLocationPermission
              ? "Background tracking active"
              : "Foreground tracking only"
            : "Tracking inactive"}
        </Text>
      </XStack>
    );
  };

  // Render loading state
  if (locationPermission === null || !userLocation) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  // Function to open Google Maps directions
  const openDirections = async () => {
    if (!user || !walkId) return;
    
    const directionsUrl = await getDirectionsUrl(walkId, user.uid);
    if (directionsUrl) {
      Linking.openURL(directionsUrl);
    } else {
      Alert.alert("Error", "Could not generate directions. Please try again.");
    }
  };

  // Render route for current user's participant
  const renderCurrentUserRoute = () => {
    const currentUserParticipant = participants.find(p => p.id === user?.uid);
    
    if (!currentUserParticipant) return null;
    
    // Use the ParticipantWithRoute type from shared package
    const participantWithRoute = currentUserParticipant as ParticipantWithRoute;
    
    if (!participantWithRoute.route || !participantWithRoute.route.points?.length) {
      return null;
    }
    
    return (
      <>
        <Polyline
          coordinates={participantWithRoute.route.points}
          strokeWidth={4}
          strokeColor={COLORS.primary}
        />
        
        {/* Route stats overlay */}
        <XStack
          position="absolute"
          bottom={70}
          alignSelf="center"
          backgroundColor="rgba(255,255,255,0.9)"
          padding={10}
          borderRadius={8}
          zIndex={999}
          alignItems="center"
          justifyContent="center"
          gap={10}
        >
          <YStack alignItems="center">
            <Text fontSize={14} fontWeight="bold" color="$gray11">
              Distance
            </Text>
            <Text fontSize={18} fontWeight="bold" color={COLORS.primary}>
              {participantWithRoute.route.distance.text}
            </Text>
          </YStack>
          
          <View width={1} height={30} backgroundColor="$gray6" />
          
          <YStack alignItems="center">
            <Text fontSize={14} fontWeight="bold" color="$gray11">
              Time
            </Text>
            <Text fontSize={18} fontWeight="bold" color={COLORS.primary}>
              {participantWithRoute.route.duration.text}
            </Text>
          </YStack>
        </XStack>
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: walkId }} />
      <View flex={1} justifyContent="center" alignItems="center">
        {renderTrackingStatus()}

        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%", backgroundColor: "#dadada" }}
          initialRegion={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* Render all participants */}
          {participants.map((p) => {
            if (!p.lastLocation) return null;

            // Check if this marker is for the current user
            const isCurrentUser = p.id === user?.uid;

            return (
              <Marker
                key={p.id}
                coordinate={{
                  latitude: p.lastLocation.latitude,
                  longitude: p.lastLocation.longitude,
                }}
                title={p.displayName || (isCurrentUser ? "You" : "Participant")}
                pinColor={isCurrentUser ? COLORS.primary : "#2196F3"}
              />
            );
          })}
          
          {/* Render route for current user */}
          {renderCurrentUserRoute()}
        </MapView>
        
        {/* Directions button */}
        <Button
          position="absolute"
          bottom={15}
          backgroundColor={COLORS.primary}
          color="white"
          borderRadius={30}
          paddingHorizontal={20}
          paddingVertical={10}
          onPress={openDirections}
        >
          Open in Google Maps
        </Button>
      </View>
    </>
  );
}

// Map control styles can be used in JSX tags directly where needed
