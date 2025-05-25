import { stopBackgroundLocationTracking } from "@/background/backgroundLocationTask";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { useDoc } from "@/utils/firestore";
import { getWalkStatus } from "@/utils/walkUtils";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Text, View } from "tamagui";
import { ParticipantWithRoute, Walk } from "walk2gether-shared";
import MeetupSpot from "../MeetupSpot";
import WalkStatusControls from "../WalkStatusControls";
import LocationLoading from "./LocationLoading";
import OfficialWalkRoute from "./OfficialWalkRoute";
import ParticipantMarker from "./ParticipantMarker";
import UserRoute from "./UserRoute";

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

  // Find the current user's participant for route rendering
  const currentUserParticipant = user && participants 
    ? participants.find((p) => p.id === user.uid) as ParticipantWithRoute 
    : null;

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
        
        {/* Render all participants (current user and others) */}
        {status === "active" &&
          participants.map((p) => {
            if (!p.lastLocation) return null;
            const isCurrentUser = p.id === user?.uid;
            
            return (
              <ParticipantMarker
                key={p.id}
                id={p.id}
                displayName={p.displayName}
                latitude={p.lastLocation.latitude}
                longitude={p.lastLocation.longitude}
                isCurrentUser={isCurrentUser}
              />
            );
          })}

        {/* Render the official walk route (from owner's tracked locations) */}
        <OfficialWalkRoute walk={walk} />

        {/* Render route for current user */}
        <UserRoute participant={currentUserParticipant} />
      </MapView>

      {/* Location loading overlay */}
      <LocationLoading isLoading={locationPermission === null || !userLocation} />

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
