import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { Stack } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Button, Text, View, XStack } from "tamagui";
import { ParticipantWithRoute, Walk } from "walk2gether-shared";
import { useAuth } from "../../../context/AuthContext";
import { useLocationTracking } from "../../../hooks/useLocationTracking";
import { useWalkParticipants } from "../../../hooks/useWaitingParticipants";
import { COLORS } from "../../../styles/colors";
import { useDoc } from "../../../utils/firestore";
import { getDirectionsUrl } from "../../../utils/routeUtils";
import WalkStatusControls from "./WalkStatusControls";

interface Props {
  walkId: string;
}

export default function LiveWalkMap({ walkId }: Props) {
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);

  // Get current user participant and participant status
  const [userParticipant, setUserParticipant] = useState<any>(null);
  const [navigationMethod, setNavigationMethod] = useState<
    "walking" | "driving"
  >("walking");

  // Get extra fields to include in location updates
  const getExtraLocationFields = () => ({
    displayName: user?.displayName || "Anonymous",
    photoURL: user?.photoURL || null,
    navigationMethod: navigationMethod,
  });

  // Get walk participants
  const participants = useWalkParticipants(walkId);

  // Use the location tracking hook
  const {
    userLocation,
    locationPermission,
    backgroundLocationPermission,
    locationTracking,
  } = useLocationTracking(walkId, user?.uid, getExtraLocationFields);

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
        } else {
          setNavigationMethod("walking");
        }
      }
    }
  }, [participants, user]);

  // Get walk data to access start location
  const { doc: walk } = useDoc<Walk>(`walks/${walkId}`);

  // The user and walkId are now passed directly to the background task
  // through the useLocationTracking hook's startBackgroundLocationTracking function

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

  // Show tracking status indicator and map controls
  const renderMapControls = () => {
    return (
      <XStack
        position="absolute"
        top={10}
        left={10}
        right={10}
        justifyContent="space-between"
        zIndex={999}
      >
        {/* Tracking status indicator */}
        <XStack
          backgroundColor="rgba(255,255,255,0.8)"
          paddingHorizontal={10}
          paddingVertical={5}
          borderRadius={15}
          alignItems="center"
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

        {/* Google Maps directions button - now at the top right */}
        <Button
          size="$2"
          backgroundColor={COLORS.primary}
          color="white"
          borderRadius={15}
          onPress={openDirections}
          paddingHorizontal={10}
        >
          Open in Maps
        </Button>
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
        />
      </>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: walkId }} />
      <View flex={1} justifyContent="center" alignItems="center">
        {renderMapControls()}

        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={{ width: "100%", height: "100%", backgroundColor: "#dadada" }}
          initialRegion={{
            latitude: userLocation?.coords.latitude || 0,
            longitude: userLocation?.coords.longitude || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* 1. Render walk start point marker */}
          {walk && walk.location && (
            <Marker
              coordinate={{
                latitude: walk.location.latitude,
                longitude: walk.location.longitude,
              }}
              title={`Start: ${walk.location.name}`}
              description="Walk meeting point"
              // Use a distinct color for the start point
              pinColor="#4CAF50" // Green color for start point
            />
          )}

          {/* 2 & 3. Render all participants (current user and others) */}
          {participants.map((p) => {
            if (!p.lastLocation) return null;

            // Check if this marker is for the current user
            const isCurrentUser = p.id === user?.uid;

            return isCurrentUser ? (
              // Blue dot for current user location
              <Marker
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
                title={p.displayName || "Participant"}
                description="Participant location"
                pinColor="#2196F3"
              />
            );
          })}

          {/* Render route for current user */}
          {renderCurrentUserRoute()}
        </MapView>

        {/* Combined control for status and navigation method */}
        <WalkStatusControls
          walkId={walkId}
          userId={user?.uid}
          initialStatus={userParticipant?.status || "pending"}
          initialNavigationMethod={navigationMethod}
          onNavigationMethodChange={(isDriving) =>
            setNavigationMethod(isDriving ? "driving" : "walking")
          }
        />
      </View>
    </>
  );
}
