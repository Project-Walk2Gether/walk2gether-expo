import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
// import { currentRound, userPair } from "@/utils/walkUtils";
import WalkChat, { ChatMessage } from "@/components/Chat/WalkChat";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button, H3, Text, View, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import FullScreenLoader from "../FullScreenLoader";

// Interface for participant location data
interface ParticipantLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

// Interface for walk participant data
interface Participant {
  id: string;
  displayName?: string;
  lastLocation?: ParticipantLocation;
}

export default function ActiveWalkScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const mapRef = useRef<MapView>(null);
  const locationUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to participants collection
  useEffect(() => {
    if (!id) return;

    // Set up real-time listener for participants
    const participantsRef = collection(db, `walks/${id}/participants`);
    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const participantData: Participant[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        participantData.push({
          id: doc.id,
          displayName: data.displayName,
          lastLocation: data.lastLocation
            ? {
                latitude: data.lastLocation.latitude,
                longitude: data.lastLocation.longitude,
                timestamp: data.lastLocation.timestamp.toDate(),
              }
            : undefined,
        });
      });
      setParticipants(participantData);
    });

    // Subscribe to walk messages
    const subscribeToMessages = () => {
      const messagesRef = collection(db, `walks/${id}/messages`);
      const q = query(messagesRef, orderBy("createdAt", "asc"));

      const messagesUnsubscribe = onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            senderId: data.senderId,
            message: data.message,
            createdAt: data.createdAt,
            read: data.read || false,
          };
        });

        setMessages(messagesList);
        setLoadingMessages(false);
      });

      return messagesUnsubscribe;
    };

    const messagesUnsubscribe = subscribeToMessages();

    // Clean up the subscriptions
    return () => {
      unsubscribe();
      if (messagesUnsubscribe) messagesUnsubscribe();
    };
  }, [id]);

  // Request location permissions and get initial location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          setUserLocation(location);

          // Center map on user's location initially if we have it
          if (location && location.coords) {
            setRegion({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } else if (walk?.location) {
            // Otherwise center on the walk location
            setRegion({
              latitude: walk.location.latitude,
              longitude: walk.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }

          // Start updating location to Firestore
          startLocationUpdates();
        } catch (error) {
          console.error("Error getting initial location:", error);
          Alert.alert(
            "Location Error",
            "Unable to get your current location. Please check your device settings."
          );
        }
      }
    })();

    return () => {
      // Cleanup: Stop location updates when component unmounts
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, [walk]);

  // Start periodic location updates
  const startLocationUpdates = () => {
    if (locationUpdateInterval.current) {
      clearInterval(locationUpdateInterval.current);
    }

    // Update location every 10 seconds
    locationUpdateInterval.current = setInterval(async () => {
      updateUserLocation();
    }, 10000); // 10 seconds

    // Also update immediately
    updateUserLocation();
  };

  // Function to update user's location in Firestore
  const updateUserLocation = async () => {
    if (!user?.uid || !id) return;

    try {
      setIsUpdatingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);

      // Update the user's location in Firestore
      const participantDocRef = doc(db, `walks/${id}/participants/${user.uid}`);
      await updateDoc(participantDocRef, {
        lastLocation: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error("Error updating location:", error);
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  // Center the map on the user's location
  const centerOnUser = () => {
    if (userLocation?.coords) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Center the map to show all participants
  const showAllParticipants = () => {
    if (!participants || participants.length === 0) return;

    // Filter participants with locations
    const validParticipants = participants.filter(
      (p: Participant) => p.lastLocation
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

    // Animate to the calculated region
    mapRef.current?.animateToRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: maxLat - minLat,
      longitudeDelta: maxLng - minLng,
    });
  };

  if (!walk) return <FullScreenLoader />;

  const round = currentRound(walk);

  // Show a message that this walk hasn't started yet
  if (!round) {
    return (
      <View style={styles.container}>
        <YStack
          space="$4"
          padding="$4"
          alignItems="center"
          justifyContent="center"
        >
          <H3>Walk has not started yet</H3>
          <Text>The walk organizer will start it soon.</Text>
        </YStack>
      </View>
    );
  }

  // Get the user's pair
  const pair = userPair(round);

  return (
    <View style={styles.container}>
      {locationPermission === false && (
        <View style={styles.permissionAlert}>
          <Text style={styles.permissionText}>
            Location permission is required to share your location with other
            walkers. Please enable location in your device settings.
          </Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass
          showsScale
        >
          {/* Show markers for all participants who have a location */}
          {participants?.map((participant: Participant) => {
            if (!participant.lastLocation) return null;

            const isCurrentUser = participant.id === user?.uid;
            return (
              <Marker
                key={participant.id}
                coordinate={{
                  latitude: participant.lastLocation.latitude,
                  longitude: participant.lastLocation.longitude,
                }}
                title={participant.displayName || "Walker"}
                description={
                  isCurrentUser
                    ? "You are here"
                    : `Last updated: ${new Date(
                        participant.lastLocation.timestamp
                      ).toLocaleTimeString()}`
                }
                pinColor={isCurrentUser ? "blue" : "red"}
              />
            );
          })}

          {/* Show the meeting point */}
          {walk?.location && (
            <Marker
              coordinate={{
                latitude: walk.location.latitude,
                longitude: walk.location.longitude,
              }}
              title="Meeting Point"
              description={"Meeting location"}
              pinColor="green"
            />
          )}
        </MapView>

        {/* Map control buttons */}
        <View style={styles.mapControls}>
          <Button
            size="$2"
            backgroundColor={COLORS.action}
            color={COLORS.textOnDark}
            onPress={centerOnUser}
            style={styles.mapButton}
          >
            My Location
          </Button>
          <Button
            size="$2"
            backgroundColor={COLORS.action}
            color={COLORS.textOnDark}
            onPress={showAllParticipants}
            style={styles.mapButton}
          >
            Show All
          </Button>
          <Button
            size="$2"
            backgroundColor={COLORS.action}
            color={COLORS.textOnDark}
            onPress={updateUserLocation}
            disabled={isUpdatingLocation}
            style={styles.mapButton}
          >
            {isUpdatingLocation ? "Updating..." : "Update Location"}
          </Button>
        </View>

        {isUpdatingLocation && (
          <View style={styles.updateIndicator}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* Information about who you're walking with */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoHeader}>
          {pair ? "You are walking with:" : "No walking partner assigned yet"}
        </Text>
        {pair && (
          <View style={styles.pairInfo}>
            <Text style={styles.pairName}>Your Partner</Text>
            {/* Displaying walk information */}
            <Text style={styles.pairStatus}>{walk?.name || "Active Walk"}</Text>
          </View>
        )}
      </View>

      {/* Walk Chat Section */}
      <View style={styles.chatContainer}>
        <WalkChat
          messages={messages}
          loading={loadingMessages}
          currentUserId={user?.uid || ""}
          onSendMessage={sendWalkMessage}
          keyboardVerticalOffset={90}
          containerStyle={styles.walkChatContainer}
        />
      </View>
    </View>
  );
}

// Function to send a message in the walk chat
const sendWalkMessage = async (message: string) => {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const id = params.id as string;

  if (!message.trim() || !user || !id) return;

  try {
    const messagesRef = collection(db, `walks/${id}/messages`);
    await addDoc(messagesRef, {
      senderId: user.uid,
      message,
      createdAt: serverTimestamp(),
      read: false,
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    height: "50%",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapControls: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "column",
    gap: 5,
  },
  mapButton: {
    padding: 8,
    marginBottom: 5,
  },
  updateIndicator: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 5,
    borderRadius: 5,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  infoHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  pairInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pairName: {
    fontWeight: "bold",
    fontSize: 15,
  },
  pairStatus: {
    color: "#666",
  },
  permissionAlert: {
    backgroundColor: "#ffcccc",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  permissionText: {
    color: "#990000",
    textAlign: "center",
  },
  chatContainer: {
    height: "35%",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  walkChatContainer: {
    height: "100%",
  },
});
