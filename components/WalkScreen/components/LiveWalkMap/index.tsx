import { stopBackgroundLocationTracking } from "@/background/backgroundLocationTask";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useSheet } from "@/context/SheetContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { calculateOptimalRegion } from "@/utils/mapUtils";
import { getWalkStatus, isOwner } from "@/utils/walkUtils";
import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import { MapPin } from "@tamagui/lucide-icons";
import { addHours, differenceInHours } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Card, Text, View, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";
import CurrentUserStatusCard from "../CurrentUserStatusCard";
import MeetupSpot from "../MeetupSpot";
import RequestBackgroundLocationModal from "../RequestBackgroundLocationModal";
import { WalkActionSliders } from "../WalkActionSliders";
import WalkLocationCard from "../WalkLocationCard";
import WalkParticipantStatusControls from "../WalkParticipantStatusControls";
import LocationLoading from "./LocationLoading";
import OfficialWalkRoute from "./OfficialWalkRoute";
import ParticipantMarker from "./ParticipantMarker";

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
  const {
    locationPermission,
    backgroundLocationPermission,
    requestForegroundPermissions,
  } = useLocation();
  const [isBackgroundLocationModalOpen, setIsBackgroundLocationModalOpen] =
    useState(false);

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
    user!.uid,
    userParticipant
  );

  // Get walk data to access start location and check if user is owner
  const { doc: walk } = useDoc<Walk>(`walks/${walkId}`);

  // Get access to location context for tracking functions
  const locationContext = useLocation();

  // Check if current user is the walk owner
  const isWalkOwner = walk?.createdByUid === user?.uid;

  // Check if walk has started or ended
  const hasWalkStarted = Boolean(walk?.startedAt);
  const hasWalkEnded = Boolean(walk?.endedAt);

  const status = walk ? getWalkStatus(walk) : "pending";

  // Track the last background tracking state to prevent unnecessary updates
  const lastTrackingState = useRef<boolean | null>(null);

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
      const updateTracking = async () => {
        try {
          // Update our ref to prevent infinite loops
          lastTrackingState.current = backgroundLocationPermission;

          // Stop current tracking and restart with new preference
          console.log("Starting walk location tracking");
          await locationContext.stopWalkTracking();
          await locationContext.startWalkTracking(
            walkId,
            // TODO: use proper walk end time with buffer
            addHours(new Date(), 1)
          );
        } catch (error) {
          console.error("Error updating location tracking:", error);
          // Reset the ref if there was an error
          lastTrackingState.current = null;
        }
      };

      updateTracking();
    }
  }, [
    backgroundLocationPermission,
    walkId,
    user?.uid,
    locationContext,
    status,
    hasWalkStarted,
    hasWalkEnded,
  ]);

  // Check if walk is scheduled within the next 5 hours
  const isStartingSoon = useMemo(() => {
    if (!walk?.date) return false;

    const walkTime = walk.date.toDate();
    const now = new Date();
    const hoursDifference = differenceInHours(walkTime, now);

    // Show button if walk starts within 5 hours (including if it's already started)
    return hoursDifference < 5;
  }, [walk?.date]);

  const { showSheet, hideSheet } = useSheet();

  // Handler for starting a walk (owner only)
  const handleStartWalk = async () => {
    // When starting a walk, use the user's background tracking preference
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

      // Start location tracking with the user's background tracking preference
      if (locationContext) {
        await locationContext.startWalkTracking(walkId);
      }
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
      <View flex={1} justifyContent="center" alignItems="center" p="$4">
        <Card
          backgroundColor={COLORS.walkTypes.friends.background}
          padding="$6"
          borderRadius="$5"
          width="100%"
          maxWidth={400}
          elevate
          bordered
          borderColor="$borderColor"
        >
          <YStack alignItems="center" gap="$4">
            {/* Icon and Title */}
            <YStack alignItems="center" gap="$2">
              <View
                backgroundColor={COLORS.walkTypes.friends.main}
                width={60}
                height={60}
                borderRadius={30}
                justifyContent="center"
                alignItems="center"
                marginBottom="$2"
              >
                <MapPin size={30} color="white" />
              </View>
              <Text fontSize="$7" fontWeight="bold" textAlign="center">
                Location Access Needed
              </Text>
            </YStack>

            {/* Explanation Text */}
            <YStack gap="$3">
              <Text
                fontSize="$5"
                color={COLORS.textSecondary}
                textAlign="center"
                lineHeight={24}
              >
                To see the walk map and participate with friends, Walk2Gether
                needs access to your location.
              </Text>
              <Text
                fontSize="$5"
                color={COLORS.textSecondary}
                textAlign="center"
                lineHeight={24}
              >
                This helps everyone see where you are during walks and ensures
                you can find the meetup spot.
              </Text>
            </YStack>

            {/* CTA Button */}
            <Button
              onPress={() => requestForegroundPermissions()}
              backgroundColor={COLORS.walkTypes.friends.main}
              paddingHorizontal="$6"
              paddingVertical="$3"
              borderRadius="$6"
              marginTop="$2"
              pressStyle={{ opacity: 0.9 }}
            >
              <Text color="white" fontWeight="bold" fontSize="$5">
                Enable Location Access
              </Text>
            </Button>
          </YStack>
        </Card>
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

        {/* Render route for current user */}
        {/* <UserRoute participant={currentUserParticipant} /> */}
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
          >
            {isStartingSoon && user && walkId && userParticipant && (
              <CurrentUserStatusCard
                participant={userParticipant}
                isOwner={walk.createdByUid === user.uid}
                mt="$2"
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
