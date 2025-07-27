import { stopBackgroundLocationTracking } from "@/background/backgroundLocationTask";
import LivekitRoom from "@/components/LivekitRoom";
import CurrentUserStatusCard from "@/components/WalkScreen/components/CurrentUserStatusCard";
import LocationLoading from "@/components/WalkScreen/components/LiveWalkMap/LocationLoading";
import OfficialWalkRoute from "@/components/WalkScreen/components/LiveWalkMap/OfficialWalkRoute";
import ParticipantMarker from "@/components/WalkScreen/components/LiveWalkMap/ParticipantMarker";
import MeetupSpot from "@/components/WalkScreen/components/MeetupSpot";
import RequestBackgroundLocationModal from "@/components/WalkScreen/components/RequestBackgroundLocationModal";
import { WalkActionSliders } from "@/components/WalkScreen/components/WalkActionSliders";
import WalkLocationCard from "@/components/WalkScreen/components/WalkLocationCard";
import WalkParticipantStatusControls from "@/components/WalkScreen/components/WalkParticipantStatusControls";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useSheet } from "@/context/SheetContext";
import { useWalk } from "@/context/WalkContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { calculateOptimalRegion } from "@/utils/mapUtils";
import { getWalkStatus, isOwner } from "@/utils/walkUtils";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import { useIsFocused } from "@react-navigation/native";
import { differenceInHours } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Text, View } from "tamagui";

export default function MapTab() {
  const { walk: contextWalk } = useWalk();
  const isFocussed = useIsFocused();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const {
    locationPermission,
    backgroundLocationPermission,
    requestForegroundPermissions,
  } = useLocation();
  const [isBackgroundLocationModalOpen, setIsBackgroundLocationModalOpen] =
    useState(false);
  const [showLivekitRoom, setShowLivekitRoom] = useState(false);
  const { showSheet, hideSheet } = useSheet();

  const walkId = contextWalk?.id || "";

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
  const hasWalkEnded = Boolean(walk?.endedAt);

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

  // Handler for starting a walk (owner only)
  async function handleStartWalk() {
    if (!walk || !walk.id) return;

    try {
      await setDoc(
        doc(firestore_instance, "walks", walk.id),
        {
          startedAt: Timestamp.now(),
          status: "active",
        },
        { merge: true }
      );

      // Show confirmation alert
      Alert.alert(
        "Walk Started",
        "Your walk has officially started. Participants will be notified.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error starting walk:", error);
      Alert.alert(
        "Error",
        "There was a problem starting the walk. Please try again."
      );
    }
  }

  // Handler for ending a walk (owner only)
  async function handleEndWalk() {
    if (!walk || !walk.id) return;

    try {
      await setDoc(
        doc(firestore_instance, "walks", walk.id),
        {
          endedAt: Timestamp.now(),
          status: "completed",
        },
        { merge: true }
      );

      // Stop background tracking for the current user
      stopBackgroundLocationTracking();

      // Show confirmation alert
      Alert.alert(
        "Walk Ended",
        "Your walk has ended. Thank you for using Walk2gether!",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error ending walk:", error);
      Alert.alert(
        "Error",
        "There was a problem ending the walk. Please try again."
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
      >
        {/* Only show MeetupSpot if the walk hasn't started yet */}
        {walk?.startLocation ? (
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
          <WalkLocationCard
            location={walk.currentLocation}
            locationName={walk.currentLocation?.name}
            notes={walk.startLocation?.notes}
            showMap={false}
            meetupSpotPhoto={walk.meetupSpotPhoto}
            isWalkOwner={isWalkOwner}
            walkId={walkId}
            isVirtual={walk.type === "virtual"}
          >
            {isStartingSoon && user && walkId && userParticipant && (
              <CurrentUserStatusCard
                participant={userParticipant}
                isOwner={walk.createdByUid === user.uid}
                onPress={() => {
                  if (!walk || !user) return;

                  showSheet(
                    <WalkParticipantStatusControls
                      status={userParticipant.status || "pending"}
                      isCancelled={!!userParticipant.cancelledAt}
                      isOwner={walk.createdByUid === user.uid}
                      walkId={walk.id}
                      userId={user.uid}
                      navigationMethod={
                        userParticipant.navigationMethod || "driving"
                      }
                      onClose={() => {
                        hideSheet();
                      }}
                    />,
                    {
                      title: "Update Your Status",
                      dismissOnSnapToBottom: true,
                    }
                  );
                }}
              />
            )}
          </WalkLocationCard>
        </View>
      )}

      {/* Toggle button for LivekitRoom */}
      <View
        position="absolute"
        bottom={walk && isOwner(walk) ? 100 : 20}
        right={20}
        zIndex={10}
      >
        <View
          backgroundColor="$background"
          paddingHorizontal={16}
          paddingVertical={12}
          borderRadius={30}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          pressStyle={{ opacity: 0.8 }}
          onPress={() => setShowLivekitRoom(!showLivekitRoom)}
        >
          <Text fontWeight="bold" color="$color">
            {showLivekitRoom ? "Hide Video Chat" : "Show Video Chat"}
          </Text>
        </View>
      </View>

      {/* LivekitRoom component */}
      {showLivekitRoom && (
        <View
          position="absolute"
          bottom={walk && isOwner(walk) ? 160 : 80}
          right={20}
          left={20}
          height={300}
          zIndex={5}
          backgroundColor="$background"
          borderRadius={12}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.2}
          shadowRadius={4}
          overflow="hidden"
        >
          <LivekitRoom />
        </View>
      )}

      {/* Location loading overlay */}
      <LocationLoading
        isLoading={locationPermission === null || !userLocation}
      />

      {/* Controls rendered using absolute positioning */}
      {walk && isOwner(walk) ? (
        <WalkActionSliders
          showStartWalkSlider={!walk?.startedAt && !walk?.endedAt}
          showEndWalkSlider={!!walk?.startedAt && !walk?.endedAt}
          onStartWalk={handleStartWalk}
          onEndWalk={handleEndWalk}
        />
      ) : null}

      <RequestBackgroundLocationModal
        open={isBackgroundLocationModalOpen}
        onOpenChange={setIsBackgroundLocationModalOpen}
      />
    </View>
  );
}
