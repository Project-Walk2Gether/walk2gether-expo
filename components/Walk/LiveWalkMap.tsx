import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import * as Linking from "expo-linking";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, AppState, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { Button, Text, View } from "tamagui";

// Define a task name for background location tracking
const LOCATION_TRACKING_TASK = "background-location-tracking";

// Declare global types for background tracking
declare global {
  var currentUser: any;
  var currentWalkId: string;
}

// Participant type for the map
export interface Participant {
  id: string;
  displayName?: string;
  photoURL?: string;
  lastLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

interface LiveWalkMapProps {
  walkId: string;
}

// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody<any>) => {
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
});

export default function LiveWalkMap({ walkId }: LiveWalkMapProps) {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [backgroundLocationPermission, setBackgroundLocationPermission] = useState<boolean | null>(
    null
  );
  const [locationTracking, setLocationTracking] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const mapRef = useRef<MapView>(null);

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
    const subscription = AppState.addEventListener("change", nextAppState => {
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
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(foregroundStatus === "granted");

      if (foregroundStatus !== "granted") {
        Alert.alert(
          "Location Permission",
          "We need your location to show you on the map. Please enable location services for this app in your settings."
        );
        return;
      }

      // Request background permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
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
                if (Platform.OS === 'ios') {
                  // On iOS we can open the app settings directly
                  Linking.openURL('app-settings:');
                } else {
                  // On Android we can't directly open location settings, so we open app settings
                  Linking.openSettings();
                }
              }
            }
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

  // Update user's location in Firestore
  const updateUserLocation = async (location: Location.LocationObject) => {
    if (!user || !walkId) return;

    try {
      // Update the user's location in Firestore
      const participantDocRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${user.uid}`
      );
      await updateDoc(participantDocRef, {
        lastLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().getTime(),
        },
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || null,
      });
    } catch (error) {
      console.error("Error updating user location:", error);
    }
  };

  // Set up real-time listener for participants
  useEffect(() => {
    if (!walkId) return;

    const participantsRef = collection(
      firestore_instance,
      `walks/${walkId}/participants`
    );
    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const participantData: Participant[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        participantData.push({
          id: doc.id,
          displayName: data.displayName,
          photoURL: data.photoURL,
          lastLocation: data.lastLocation,
        });
      });
      setParticipants(participantData);
    });

    return () => {
      unsubscribe();
    };
  }, [walkId]);

  // Show all participants on the map
  const showAllParticipants = () => {
    if (!mapRef.current || participants.length === 0) return;

    // Filter out participants with no location
    const validParticipants = participants.filter(
      (p) => p.lastLocation !== undefined
    );

    if (validParticipants.length === 0) return;

    // Calculate bounds that include all participants
    let minLat = validParticipants[0].lastLocation!.latitude;
    let maxLat = validParticipants[0].lastLocation!.latitude;
    let minLng = validParticipants[0].lastLocation!.longitude;
    let maxLng = validParticipants[0].lastLocation!.longitude;

    validParticipants.forEach((p: Participant) => {
      if (!p.lastLocation) return;
      minLat = Math.min(minLat, p.lastLocation.latitude);
      maxLat = Math.max(maxLat, p.lastLocation.latitude);
      minLng = Math.min(minLng, p.lastLocation.longitude);
      maxLng = Math.max(maxLng, p.lastLocation.longitude);
    });

    // Add some padding
    const PADDING = 0.01;
    minLat -= PADDING;
    maxLat += PADDING;
    minLng -= PADDING;
    maxLng += PADDING;

    const region: Region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: maxLat - minLat,
      longitudeDelta: maxLng - minLng,
    };

    mapRef.current.animateToRegion(region, 1000);
  };

  // Focus on user's location
  const focusUserLocation = () => {
    if (!mapRef.current || !userLocation) return;

    mapRef.current.animateToRegion(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      1000
    );
  };

  // Render location permission denied message
  if (locationPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
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
    if (appState !== 'active') return null; // Only show in active state
    
    return (
      <View style={styles.trackingStatus}>
        <View 
          style={[styles.statusIndicator, { backgroundColor: locationTracking ? '#4caf50' : '#ff9800' }]} 
        />
        <Text fontSize="$2" color={locationTracking ? '#4caf50' : '#ff9800'}>
          {locationTracking ? 
            (backgroundLocationPermission ? 'Background tracking active' : 'Foreground tracking only') : 
            'Tracking inactive'}
        </Text>
      </View>
    );
  }

  // Render loading state
  if (locationPermission === null || !userLocation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderTrackingStatus()}
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
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
      </MapView>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <Button
          size="$3"
          circular
          backgroundColor="white"
          onPress={focusUserLocation}
          style={styles.mapButton}
        >
          Me
        </Button>
        <Button
          size="$3"
          circular
          backgroundColor="white"
          onPress={showAllParticipants}
          style={styles.mapButton}
        >
          All
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
    backgroundColor: "#dadada",
  },
  mapControls: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "column",
    gap: 10,
  },
  mapButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  trackingStatus: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
