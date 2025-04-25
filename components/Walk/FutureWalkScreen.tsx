import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Users,
  X,
} from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  Avatar,
  Button,
  Card,
  H3,
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { Walk } from "walk2gether-shared";
import { firestore_instance } from "../../config/firebase";
import { getWalkTypeData } from "../../constants/walkTypes";
import { useAuth } from "../../context/AuthContext";
import { useWalks } from "../../context/WalksContext";
import { COLORS } from "../../styles/colors";

interface Props {
  walk: Walk;
}

// Interface for participant data
interface Participant {
  id: string;
  displayName?: string;
  photoURL?: string;
}

export default function FutureWalkScreen({ walk }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const { cancelRSVP } = useWalks();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const isMyWalk = user?.uid === walk.createdByUid;
  const walkDate = walk.date?.toDate() || new Date();
  const walkTypeData = getWalkTypeData(walk.type || "default");

  // Format date and time
  const formattedDate = format(walkDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(walkDate, "h:mm a");
  const formattedRelativeDate = format(walkDate, "PPP");
  const formattedRelativeTime = format(walkDate, "p");

  // Cancel my RSVP
  const handleCancelRSVP = () => {
    if (!walk.id) return;

    Alert.alert(
      "Cancel RSVP",
      "Are you sure you want to cancel your RSVP for this walk?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            if (walk.id) {
              await cancelRSVP(walk.id);
              Alert.alert(
                "RSVP Cancelled",
                "You have cancelled your RSVP for this walk."
              );
              router.back();
            }
          },
        },
      ]
    );
  };

  // Cancel the walk (if I'm the organizer)
  const handleCancelWalk = () => {
    if (!walk.id || !isMyWalk) return;

    Alert.alert(
      "Cancel Walk",
      "Are you sure you want to cancel this walk? This will notify all participants.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              if (walk.id) {
                // Update the walk status to cancelled
                const walkDocRef = firestore_instance.doc(`walks/${walk.id}`);
                await walkDocRef.update({
                  cancelled: true,
                  cancellationReason: "Cancelled by organizer",
                  updatedAt: new Date(),
                });

                Alert.alert(
                  "Walk Cancelled",
                  "You have cancelled this walk. Participants will be notified."
                );
                router.back();
              }
            } catch (error) {
              console.error("Error cancelling walk:", error);
              Alert.alert(
                "Error",
                "Failed to cancel the walk. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Edit the walk (if I'm the organizer)
  const handleEditWalk = () => {
    if (walk.id && isMyWalk) {
      router.push(`/edit-walk/${walk.id}`);
    }
  };

  // Open in maps
  const openInMaps = () => {
    if (!walk.location?.latitude || !walk.location?.longitude) return;

    const scheme = Platform.OS === "ios" ? "maps:" : "geo:";
    const locationName = walk.location.name || "Meeting Point";

    const url =
      Platform.OS === "ios"
        ? `${scheme}?ll=${walk.location.latitude},${
            walk.location.longitude
          }&q=${encodeURIComponent(locationName)}`
        : `${scheme}${walk.location.latitude},${
            walk.location.longitude
          }?q=${encodeURIComponent(locationName)}`;

    Linking.openURL(url).catch((err) => {
      console.error("Error opening maps:", err);
      Alert.alert("Error", "Could not open maps application");
    });
  };

  // Share the walk
  const handleShareWalk = () => {
    // Implementation would depend on your app's sharing functionality
    Alert.alert("Share Walk", "Sharing functionality to be implemented");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Walk with ${walk.organizerName}`,
        }}
      />
      <View 
        flex={1}
        backgroundColor={COLORS.background}
        padding="$4"
      >
        <Card 
          backgroundColor="white"
          borderRadius={16}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={3}
          marginTop={20}
        >
          <YStack padding="$4" gap="$4">
            {/* Walk Type Header */}
            <XStack alignItems="center" gap="$2">
              {React.createElement(walkTypeData.icon, {
                size: 20,
                color: walkTypeData.backgroundColor,
              })}
              <Text
                fontSize="$3"
                fontWeight="500"
                color={walkTypeData.backgroundColor}
              >
                {walkTypeData.label}
              </Text>
            </XStack>

            {/* Walk Title & Date */}
            <YStack gap="$2">
              <H3>{walk.organizerName}'s Walk</H3>
              <XStack alignItems="center" gap="$2">
                <Calendar size="$1" color={COLORS.primary} />
                <Text fontWeight="600" fontSize="$4">
                  {formattedDate}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Clock size="$1" color={COLORS.primary} />
                <Text fontSize="$4">
                  {formattedTime} • {walk.durationMinutes} minutes
                </Text>
              </XStack>
            </YStack>

            <Separator />

            {/* Map & Location Section */}
            <YStack gap="$3">
              {walk.location && (
                <>
                  <XStack alignItems="center" gap="$2">
                    <MapPin size="$1" color={COLORS.primary} />
                    <Text fontSize="$4" fontWeight="500">
                      {walk.location.name}
                    </Text>
                  </XStack>

                  {/* Map preview */}
                  <Card bordered 
                    style={{
                      width: "100%",
                      height: 200,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    <MapView
                      style={{ width: "100%", height: "100%" }}
                      initialRegion={{
                        latitude: walk.location.latitude,
                        longitude: walk.location.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      rotateEnabled={false}
                      pitchEnabled={false}
                    >
                      <Marker
                        coordinate={{
                          latitude: walk.location.latitude,
                          longitude: walk.location.longitude,
                        }}
                        title={walk.location.name}
                        description="Meeting point"
                      />
                    </MapView>

                    <Button
                      position="absolute"
                      bottom={10}
                      right={10}
                      backgroundColor={COLORS.action}
                      color={COLORS.textOnDark}
                      size="$3"
                      onPress={openInMaps}
                      icon={<Navigation size="$1" color="white" />}
                    >
                      Directions
                    </Button>
                  </Card>
                </>
              )}
            </YStack>

            <Separator />

            {/* Participants Section */}
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <Users size="$1" color={COLORS.primary} />
                <Text fontSize="$4" fontWeight="600">
                  Participants ({participants.length})
                </Text>
              </XStack>

              <XStack flexWrap="wrap" gap="$2">
                {participants.map((participant) => (
                  <XStack
                    key={participant.id}
                    alignItems="center"
                    gap="$2"
                    padding="$2"
                    backgroundColor="$backgroundHover"
                    borderRadius="$4"
                  >
                    <Avatar size="$2" circular>
                      <Avatar.Image src={participant.photoURL} />
                      <Avatar.Fallback backgroundColor={COLORS.primary}>
                        {participant.displayName?.[0] || "?"}
                      </Avatar.Fallback>
                    </Avatar>
                    <Text fontSize="$3">
                      {participant.displayName || "Anonymous"}
                    </Text>
                  </XStack>
                ))}

                {participants.length === 0 && (
                  <Text color="$textMuted">
                    No participants yet. Be the first to join!
                  </Text>
                )}
              </XStack>
            </YStack>
          </YStack>
        </Card>

        {/* Action Buttons */}
        <YStack padding="$4" gap="$3">
          {isMyWalk ? (
            <>
              <Button
                size="$4"
                backgroundColor={COLORS.action}
                color={COLORS.textOnDark}
                onPress={handleEditWalk}
              >
                Edit Walk Details
              </Button>

              <Button
                size="$4"
                backgroundColor="#f44336"
                color="white"
                onPress={handleCancelWalk}
                icon={<X size="$1" color="white" />}
              >
                Cancel Walk
              </Button>
            </>
          ) : (
            <>
              <Button
                size="$4"
                backgroundColor={COLORS.action}
                color={COLORS.textOnDark}
                onPress={handleShareWalk}
              >
                Invite Friends
              </Button>

              <Button
                size="$4"
                backgroundColor="#f44336"
                color="white"
                onPress={handleCancelRSVP}
                icon={<X size="$1" color="white" />}
              >
                Cancel My RSVP
              </Button>
            </>
          )}
        </YStack>

        {/* Countdown Section */}
        <Card 
          marginTop="auto"
          backgroundColor="white"
          borderRadius={16}
          padding="$4"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
          elevation={3}
          marginBottom="$4"
        >
          <Text
            fontSize="$4"
            fontWeight="600"
            textAlign="center"
            marginBottom="$2"
          >
            Happening in
          </Text>
          <Text
            fontSize="$8"
            fontWeight="700"
            textAlign="center"
            color={COLORS.primary}
          >
            {getTimeUntilWalk(walkDate)}
          </Text>
        </Card>
      </View>
    </>
  );
}

// Helper function to calculate time until walk
function getTimeUntilWalk(walkDate: Date): string {
  const now = new Date();
  const diffMs = walkDate.getTime() - now.getTime();

  // If less than a minute away
  if (diffMs < 60000) {
    return "Less than a minute";
  }

  const diffMins = Math.floor(diffMs / 60000);

  // If less than an hour away
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"}`;
  }

  const diffHours = Math.floor(diffMins / 60);

  // If less than a day away
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
}

