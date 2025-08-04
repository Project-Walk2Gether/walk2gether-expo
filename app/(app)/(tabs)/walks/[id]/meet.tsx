import { stopBackgroundLocationTracking } from "@/background/backgroundLocationTask";
import { syncRoundRotationTask } from "@/background/roundRotationTask";
import LocationLoading from "@/components/WalkScreen/components/LiveWalkMap/LocationLoading";
import OfficialWalkRoute from "@/components/WalkScreen/components/LiveWalkMap/OfficialWalkRoute";
import ParticipantMarker from "@/components/WalkScreen/components/LiveWalkMap/ParticipantMarker";
import MeetupSpot from "@/components/WalkScreen/components/MeetupSpot";
import MeetupSpotCard from "@/components/WalkScreen/components/MeetupSpotCard";
import RequestBackgroundLocationModal from "@/components/WalkScreen/components/RequestBackgroundLocationModal";
import { StartWalkSlider } from "@/components/WalkScreen/components/StartWalkSlider";
import StatusUpdateButton from "@/components/WalkScreen/components/StatusUpdateButton";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useWalk } from "@/context/WalkContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { calculateOptimalRegion } from "@/utils/mapUtils";
import { startNextRound } from "@/utils/roundUtils";
import { getWalkStatus, isOwner } from "@/utils/walkUtils";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import { differenceInHours } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Text, View, XStack } from "tamagui";

export default function MeetTab() {
  const { walk: contextWalk } = useWalk();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const { locationPermission, backgroundLocationPermission } = useLocation();
  const [isBackgroundLocationModalOpen, setIsBackgroundLocationModalOpen] =
    useState(false);
  const walkId = contextWalk?.id || "";

  // Local state for pending meetup location changes
  const [pendingMeetupLocation, setPendingMeetupLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Get walk participants
  const participants = useWalkParticipants(walkId);

  // Memoize the current user participant data
  const userParticipant = useMemo(() => {
    if (!participants || !user) return null;
    return participants.find((p) => p.id === user.uid);
  }, [participants, user]);

  // Use the location tracking hook
  const { userLocation } = useLocationTracking(
    walkId,
    user?.uid || "",
    userParticipant
  );

  // Get access to location context for tracking functions
  const locationContext = useLocation();

  // Use the walk from context instead of re-fetching
  const walk = contextWalk;

  // Check if current user is the walk owner
  const isWalkOwner = walk?.createdByUid === user?.uid;

  // Check if walk has started or ended
  const hasWalkStarted = Boolean(walk?.startedAt);
  const hasWalkEnded = Boolean(walk?.endTime);

  const status = walk ? getWalkStatus(walk) : "pending";

  // Track the last background tracking state to prevent unnecessary updates
  const lastTrackingState = useRef<boolean | null>(null);

  // Check if walk is starting soon (within 1 hour of start time)
  const isStartingSoon = useMemo(() => {
    if (!walk || !walk.date) return false;

    const scheduledDate = walk.date.toDate();
    const now = new Date();
    const hoursUntilStart = differenceInHours(scheduledDate, now);

    return hoursUntilStart <= 1;
  }, [walk?.date]);

  useEffect(() => {
    if (
      backgroundLocationPermission === false &&
      userParticipant &&
      ["on-the-way", "arrived"].includes(userParticipant.status)
    ) {
      setIsBackgroundLocationModalOpen(true);
    }
  }, [backgroundLocationPermission, userParticipant?.status]);

  // Automatically update location tracking when the tracking preference changes
  useEffect(() => {
    // Skip if the tracking state hasn't changed from the last time we updated
    if (lastTrackingState.current === backgroundLocationPermission) {
      return;
    }

    // Only apply if we have a valid walkId, user, and the walk is active
    if (
      walkId &&
      user?.uid &&
      locationContext?.backgroundLocationPermission &&
      status === "active" &&
      hasWalkStarted &&
      !hasWalkEnded
    ) {
      console.log(
        "Updating location tracking to:",
        backgroundLocationPermission
      );
      updateTracking();
    }

    // Update the last tracking state reference
    lastTrackingState.current = backgroundLocationPermission;
  }, [
    backgroundLocationPermission,
    walkId,
    user,
    status,
    hasWalkStarted,
    hasWalkEnded,
  ]);

  function updateTracking() {
    if (!user?.uid || !walkId) return;

    // If we don't have background permission, stop tracking
    if (!backgroundLocationPermission) {
      console.log("Stopping background tracking - no permission");
      stopBackgroundLocationTracking();
      return;
    }

    // Only track when we're on the way or have arrived
    if (
      userParticipant &&
      ["on-the-way", "arrived"].includes(userParticipant.status) &&
      !userParticipant.cancelledAt
    ) {
      console.log("Starting background tracking");
      // Use the appropriate method from locationContext to start tracking
      if (locationContext.requestBackgroundPermissions) {
        locationContext.requestBackgroundPermissions();
      }
    } else {
      console.log("Stopping background tracking - not participating actively");
      stopBackgroundLocationTracking();
    }
  }

  // Handler for long press on map to change meetup location (owner only)
  const handleMapLongPress = (event: any) => {
    if (!isWalkOwner || hasWalkStarted) return;

    const { coordinate } = event.nativeEvent;
    setPendingMeetupLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  // Handler for updating meetup location
  const handleUpdateMeetupLocation = async () => {
    if (!walk || !pendingMeetupLocation) return;

    try {
      await setDoc(
        doc(firestore_instance, "walks", walk.id),
        {
          startLocation: {
            ...walk.startLocation,
            latitude: pendingMeetupLocation.latitude,
            longitude: pendingMeetupLocation.longitude,
          },
          currentLocation: {
            ...walk.currentLocation,
            latitude: pendingMeetupLocation.latitude,
            longitude: pendingMeetupLocation.longitude,
          },
        },
        { merge: true }
      );

      // Clear pending state
      setPendingMeetupLocation(null);

      Alert.alert("Success", "Meetup location updated successfully!");
    } catch (error) {
      console.error("Error updating meetup location:", error);
      Alert.alert(
        "Error",
        "There was a problem updating the meetup location. Please try again."
      );
    }
  };

  // Handler for canceling pending meetup location change
  const handleCancelLocationChange = () => {
    setPendingMeetupLocation(null);
  };

  // Handler for starting a walk (owner only)
  async function handleStartWalk() {
    if (!walk || !walk.id) return;

    try {
      // Start the walk
      await setDoc(
        doc(firestore_instance, "walks", walk.id),
        {
          startedAt: Timestamp.now(),
          status: "active",
        },
        { merge: true }
      );

      // Start the first round automatically if it's a meetup walk
      if (walk.type === "meetup") {
        try {
          await startNextRound(walk);
          // Sync the round rotation task for automatic future rounds
          await syncRoundRotationTask(walk.id);
        } catch (roundError) {
          console.error(
            "Error starting first round or syncing rotation:",
            roundError
          );
          // Don't fail the walk start if round starting fails
        }
      }

      // Navigate to the connect tab
      router.push(`/(tabs)/walks/${walk.id}/connect` as any);
    } catch (error) {
      console.error("Error starting walk:", error);
      Alert.alert(
        "Error",
        "There was a problem starting the walk. Please try again."
      );
    }
  }

  // Return loading screen if we don't have walk or focus
  if (!walk || !walk.id) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <View padding="$4">
          <Text fontSize="$5" textAlign="center">
            Loading walk...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: "100%", height: "100%", backgroundColor: "#dadada" }}
        initialRegion={calculateOptimalRegion(
          userLocation?.coords
            ? {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }
            : undefined,
          walk?.startLocation
        )}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onLongPress={handleMapLongPress}
      >
        {/* Only show MeetupSpot if the walk hasn't started yet */}
        {walk?.startLocation ? (
          <MeetupSpot
            location={pendingMeetupLocation || walk.startLocation}
            isWalkOwner={isWalkOwner}
            walkId={walkId}
            isPending={!!pendingMeetupLocation}
          />
        ) : null}

        {/* Render all participants (current user and others) */}
        {status === "active" &&
          participants.map((p) => {
            if (!p.lastLocation) return null;
            return (
              <ParticipantMarker
                key={p.id}
                id={p.id}
                displayName={p.displayName}
                photoURL={p.photoURL}
                latitude={p.lastLocation.latitude}
                longitude={p.lastLocation.longitude}
              />
            );
          })}

        {/* Render the official walk route (from owner's tracked locations) */}
        <OfficialWalkRoute walk={walk} />
      </MapView>

      {/* Location Card - only shown when location permissions are granted */}
      {locationPermission && walk && (
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <MeetupSpotCard
            location={walk.currentLocation}
            locationName={walk.currentLocation?.name}
            notes={walk.startLocation?.notes}
            showMap={false}
            meetupSpotPhoto={walk.meetupSpotPhoto}
            isWalkOwner={isWalkOwner}
            walkId={walkId}
            participants={participants || []}
            isStartingSoon={isStartingSoon}
          />

          {/* Update meetup location button - shown when there's a pending change */}
          {pendingMeetupLocation && isWalkOwner && !hasWalkStarted && (
            <View marginTop="$2">
              <XStack gap="$2">
                <Button
                  flex={1}
                  backgroundColor="#ff6b35"
                  color="white"
                  onPress={handleUpdateMeetupLocation}
                  fontWeight="600"
                >
                  Update meetup location
                </Button>
                <Button
                  backgroundColor="#666"
                  color="white"
                  onPress={handleCancelLocationChange}
                  fontWeight="600"
                >
                  Cancel
                </Button>
              </XStack>
            </View>
          )}
        </View>
      )}

      {/* Location loading overlay */}
      <LocationLoading
        isLoading={locationPermission === null || !userLocation}
      />

      {/* Start walk slider - only shown for walk owners when walk hasn't started and user has arrived */}
      {walk && isStartingSoon && isOwner(walk) && !walk?.startedAt && userParticipant?.status === "arrived" ? (
        <StartWalkSlider onStartWalk={handleStartWalk} />
      ) : (
        /* Status update button - shown for all participants when slider conditions aren't met */
        walk && isStartingSoon && !walk?.startedAt ? (
          <StatusUpdateButton />
        ) : null
      )}

      <RequestBackgroundLocationModal
        open={isBackgroundLocationModalOpen}
        onOpenChange={setIsBackgroundLocationModalOpen}
      />
    </View>
  );
}
