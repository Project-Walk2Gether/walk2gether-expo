import { stopBackgroundLocationTracking } from "@/background/backgroundLocationTask";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { getWalkStatus } from "@/utils/walkUtils";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Text, View } from "tamagui";
import { ParticipantWithRoute, Walk } from "walk2gether-shared";
import MeetupSpot from "./MeetupSpot";
import WalkStatusControls from "./WalkStatusControls";

interface Props {
  walkId: string;
  onNavigationMethodChange?: (method: "walking" | "driving") => void;
}

export default function LiveWalkMap({
  walkId,
  onNavigationMethodChange,
}: Props) {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);

  // Get current user participant and participant status
  const [userParticipant, setUserParticipant] = useState<any>(null);
  const [navigationMethod, setNavigationMethod] = useState<
    "walking" | "driving"
  >("walking");

  // Get walk participants
  const participants = useWalkParticipants(walkId);

  // Use the location tracking hook
  const { userLocation, locationPermission } = useLocationTracking(
    walkId,
    user!.uid
  );

  // Get and store current user participant data
  useEffect(() => {
    if (participants && user) {
      const currentUserParticipant = participants.find(
        (p) => p.id === user.uid
      );
      if (currentUserParticipant) {
        setUserParticipant(currentUserParticipant);

        // Set navigation method
        if (currentUserParticipant.navigationMethod === "driving") {
          setNavigationMethod("driving");
          onNavigationMethodChange?.("driving");
        } else {
          setNavigationMethod("walking");
          onNavigationMethodChange?.("walking");
        }
      }
    }
  }, [participants, user]);

  // Get walk data to access start location and check if user is owner
  const { doc: walk } = useDoc<Walk>(`walks/${walkId}`);

  // Check if current user is the walk owner
  const isWalkOwner = walk?.createdByUid === user?.uid;

  // Check if walk has started or ended
  const hasWalkStarted = Boolean(walk?.startedAt);
  const hasWalkEnded = Boolean(walk?.endedAt);

  const status = walk ? getWalkStatus(walk) : "pending";

  // Update parent component when navigation method changes
  useEffect(() => {
    onNavigationMethodChange?.(navigationMethod);
  }, [navigationMethod, onNavigationMethodChange]);

  // Handler for starting a walk (owner only)
  const handleStartWalk = async () => {
    if (!walkId || !user?.uid || !isWalkOwner) return;

    try {
      // Update walk status to in-progress
      const walkDocRef = doc(firestore_instance, `walks/${walkId}`);
      await setDoc(
        walkDocRef,
        {
          // Use startedAt timestamp to indicate the walk has started
          startedAt: Timestamp.now(),
          active: true,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error starting walk:", error);
      Alert.alert("Error", "Failed to start the walk. Please try again.");
    }
  };

  // Handler for ending a walk (owner only)
  const handleEndWalk = async () => {
    if (!walkId || !user?.uid || !isWalkOwner) return;

    try {
      // Stop background location tracking
      await stopBackgroundLocationTracking();

      // Update walk status to completed
      const walkDocRef = doc(firestore_instance, `walks/${walkId}`);
      await setDoc(
        walkDocRef,
        {
          // Use endedAt timestamp to indicate the walk has ended
          endedAt: Timestamp.now(),
          active: false,
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error ending walk:", error);
      Alert.alert("Error", "Failed to end the walk. Please try again.");
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

  // We'll render the map regardless, but with an overlay if location isn't ready yet

  // Render the official walk route tracked from the walk owner's locations
  const renderOfficialWalkRoute = () => {
    if (!walk?.route?.points?.length) return null;

    // Convert route points to map coordinates
    const polylineCoordinates = walk.route.points.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));

    return (
      <Polyline
        coordinates={polylineCoordinates}
        strokeWidth={5}
        strokeColor="#FF5E0E" // Use primary orange color with higher width for official route
        lineDashPattern={[0]} // Solid line
      />
    );
  };

  // Render route for current user's participant
  const renderCurrentUserRoute = () => {
    // Find the current user's participant
    if (!user || !participants) return null;

    const participantWithRoute = participants.find(
      (p) => p.id === user.uid
    ) as ParticipantWithRoute;

    // Only render route if participant has route data
    if (
      !participantWithRoute ||
      !participantWithRoute.route ||
      !participantWithRoute.route.points?.length
    ) {
      return null;
    }

    // Convert route points to map coordinates
    const polylineCoordinates = participantWithRoute.route.points.map(
      (point) => ({
        latitude: point.latitude,
        longitude: point.longitude,
      })
    );

    return (
      <>
        {/* Polyline for route */}
        <Polyline
          coordinates={polylineCoordinates}
          strokeWidth={4}
          strokeColor={COLORS.primary}
          lineDashPattern={[1, 3]} // Dashed line for user's route
        />
      </>
    );
  };

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: "100%", height: "100%", backgroundColor: "#dadada" }}
        initialRegion={{
          latitude: userLocation?.coords.latitude || 0,
          longitude: userLocation?.coords.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* 1. Render walk start point marker */}
        {walk && walk.startLocation && (
          <Marker
            coordinate={{
              latitude: walk.startLocation.latitude,
              longitude: walk.startLocation.longitude,
            }}
            title={`Start: ${walk.startLocation.name || "Meetup Point"}`}
            description="Walk meetup point"
            // Use a distinct color for the start point
            pinColor="#4CAF50" // Green color for start point
          />
        )}
        {/* Only show MeetupSpot if the walk hasn't started yet */}
        {walk?.startLocation && !hasWalkStarted ? (
          <MeetupSpot 
            location={walk.startLocation} 
            isWalkOwner={isWalkOwner} 
            walkId={walkId} 
          />
        ) : null}
        {/* 2 & 3. Render all participants (current user and others) */}
        {status === "active" &&
          participants.map((p) => {
            if (!p.lastLocation) return null;

            // Check if this marker is for the current user
            const isCurrentUser = p.id === user?.uid;

            return isCurrentUser ? (
              // Blue dot for current user location
              <Marker
                tracksViewChanges={false}
                key={p.id}
                coordinate={{
                  latitude: p.lastLocation.latitude,
                  longitude: p.lastLocation.longitude,
                }}
                title={p.displayName || "You"}
                description="Your current location"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View
                  style={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                    backgroundColor: "#2196F3", // Blue color
                    borderWidth: 3,
                    borderColor: "white",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                />
              </Marker>
            ) : (
              // Regular pin marker for other participants
              <Marker
                key={p.id}
                coordinate={{
                  latitude: p.lastLocation.latitude,
                  longitude: p.lastLocation.longitude,
                }}
                tracksViewChanges={false}
                title={p.displayName || "Participant"}
                description="Participant location"
                pinColor="#2196F3"
              />
            );
          })}

        {/* Render the official walk route (from owner's tracked locations) */}
        {renderOfficialWalkRoute()}

        {/* Render route for current user */}
        {renderCurrentUserRoute()}
      </MapView>

      {/* Location loading overlay */}
      {(locationPermission === null || !userLocation) && (
        <View
          position="absolute"
          top={80}
          right={15}
          backgroundColor="rgba(255, 255, 255, 0.8)"
          padding={10}
          borderRadius={10}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          shadowColor="#000"
          // Using Tamagui style props
          animation="bouncy"
        >
          <View marginRight={5}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
          <Text fontSize={14} color={COLORS.text}>
            Getting your location...
          </Text>
        </View>
      )}

      {/* Controls rendered using absolute positioning */}
      {status === "active" && (
        <WalkStatusControls
          walkId={walkId}
          userId={user?.uid}
          initialStatus={userParticipant?.status || "pending"}
          initialNavigationMethod={navigationMethod}
          isOwner={isWalkOwner}
          walkStarted={hasWalkStarted}
          walkEnded={hasWalkEnded}
          isCancelled={!!userParticipant?.cancelledAt}
          onNavigationMethodChange={(isDriving) =>
            setNavigationMethod(isDriving ? "driving" : "walking")
          }
          onStartWalk={handleStartWalk}
          onEndWalk={handleEndWalk}
        />
      )}
    </View>
  );
}
