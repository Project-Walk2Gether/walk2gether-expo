import { deleteDoc, doc } from "@react-native-firebase/firestore";
import {
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Map,
  MapPin,
  User,
} from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import { Button, Card, Separator, Text, View, XStack, YStack } from "tamagui";
import { Participant, Walk } from "walk2gether-shared";
import { db } from "../config/firebase";
import { getWalkTypeData } from "../constants/walkTypes";
import { useAuth } from "../context/AuthContext";
import { useWalks } from "../context/WalksContext";
import { COLORS } from "../styles/colors";
import { useDoc } from "../utils/firestore";
import WalkMenu from "./WalkMenu";

interface WalkCardProps {
  walk: Walk;
}

export default function WalkCard({ walk }: WalkCardProps) {
  const { hasUserRSVPed, rsvpForWalk, cancelRSVP } = useWalks();
  const { user } = useAuth();
  const router = useRouter();
  const isRSVPed = hasUserRSVPed(walk.id || "");
  const walkDate = walk.date?.toDate() || new Date();
  const formattedDate = format(walkDate, "EEE, MMM d");
  const formattedTime = format(walkDate, "h:mm a");
  const now = new Date();
  const isToday = walkDate.toDateString() === now.toDateString();

  // Calculate end time of the walk based on start time and duration
  const walkEndTime = new Date(walkDate);
  walkEndTime.setMinutes(
    walkEndTime.getMinutes() + (walk.durationMinutes || 0)
  );

  // A walk is active if it has started but not yet ended
  const isActive = walkDate <= now && now <= walkEndTime;
  // A walk is past only if it's end time has passed
  const isPast = walkEndTime < now;
  const isUpcoming = walkDate > now;
  const isMine = user?.uid === walk.createdByUid;

  const handleRSVP = async () => {
    if (!walk.id) return;

    router.push(`/walk/${walk.id}/request`);
  };

  // Make card tappable to view walk details
  // Make card tappable to view walk details
  const { doc: participant } = useDoc<Participant>(
    walk.id && user?.uid
      ? `walks/${walk.id}/participants/${user.uid}`
      : undefined
  );
  const handlePress = () => {
    if (!walk.id) return;
    // If user is the walk owner, always go to walk details
    if (user?.uid === walk.createdByUid) {
      router.push(`/walk/${walk.id}`);
      return;
    }
    if (participant) {
      if (participant.approvedAt) {
        router.push(`/walk/${walk.id}`);
      } else {
        router.push(`/walk/${walk.id}/request`);
      }
    } else {
      router.push(`/walk/${walk.id}/request`);
    }
  };

  const handleEdit = () => {
    if (walk.id) {
      router.push(`/edit-walk/${walk.id}`);
    }
  };

  const handleDelete = () => {
    if (!walk.id) return;

    Alert.alert(
      "Cancel Walk",
      "Are you sure you want to cancel this walk? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel Walk",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete the walk from Firestore
              const walkRef = doc(db, "walks", walk.id as string);
              await deleteDoc(walkRef);
            } catch (error) {
              console.error("Error deleting walk:", error);
              Alert.alert(
                "Error",
                "Could not delete the walk. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  // Check if current user is the creator of the walk
  const isCreator = user?.uid === walk.createdByUid;

  // Get walk type styling from shared constants
  const walkTypeData = getWalkTypeData(walk.type);

  // Create the icon element with consistent styling
  const IconComponent = walkTypeData.icon;
  const walkIcon = <IconComponent size={20} color="white" />;

  // Functions to open maps
  const openInGoogleMaps = () => {
    if (!walk.location?.latitude || !walk.location?.longitude) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${walk.location.latitude},${walk.location.longitude}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Google Maps is not installed");
      }
    });
  };

  const openInAppleMaps = () => {
    if (!walk.location?.latitude || !walk.location?.longitude) return;

    const url = `http://maps.apple.com/?ll=${walk.location.latitude},${walk.location.longitude}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Maps application not found");
      }
    });
  };

  return (
    <Card
      size="$4"
      animation="bouncy"
      overflow="hidden"
      backgroundColor="white"
      style={styles.card}
      onPress={handlePress} // Make entire card tappable even if handlePress is currently empty
      pressStyle={styles.cardPress}
      hoverStyle={styles.cardHover}
    >
      {/* Walk type banner */}
      <Card.Header
        paddingHorizontal="$4"
        paddingVertical="$4"
        style={styles.bannerContainer}
        p={0}
      >
        <LinearGradient
          colors={walkTypeData.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <XStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            pl="$4"
            pr="$2"
            py="$3"
            gap="$2"
          >
            <XStack flexShrink={1} alignItems="center" gap="$2">
              {walkIcon}
              <Text
                flexShrink={1}
                flexGrow={1}
                color="white"
                fontWeight="700"
                fontSize="$5"
              >
                {walkTypeData.label}
              </Text>
              {isMine ? (
                <XStack style={styles.hostBadge}>
                  <Text fontSize="$2" fontWeight="500" color={COLORS.primary}>
                    {isActive
                      ? "HAPPENING NOW"
                      : isPast
                      ? "YOU HOSTED"
                      : "YOU'RE HOSTING"}
                  </Text>
                </XStack>
              ) : (
                <XStack mr="$2" gap="$2" alignItems="center">
                  <View style={styles.iconContainer}>
                    <User size="$1" color="white" />
                  </View>
                  <Text fontSize="$3" fontWeight="600" color="white">
                    {walk.organizerName || "Host"}
                  </Text>
                </XStack>
              )}
            </XStack>

            {/* Owner Menu */}
            {isCreator && (
              <WalkMenu
                onEdit={handleEdit}
                onDelete={handleDelete}
                hasLocation={
                  !!walk.location?.latitude && !!walk.location?.longitude
                }
                onOpenMaps={
                  Platform.OS === "ios" ? openInAppleMaps : openInGoogleMaps
                }
              />
            )}
          </XStack>
        </LinearGradient>
      </Card.Header>

      {/* ZONE 1: Title, Time, Hosting Info */}

      <YStack p="$4" width="100%" gap="$3">
        <XStack justifyContent="space-between" alignItems="center" width="100%">
          <XStack alignItems="center" gap="$2">
            <Calendar size="$1.5" color={COLORS.primary} />
            <Text color="#333" fontWeight="600" fontSize="$5">
              {isToday ? "Today" : formattedDate}
            </Text>
          </XStack>

          <XStack alignItems="center" gap="$2">
            <Clock size="$1.5" color={COLORS.primary} />
            <Text color="#333" fontSize="$4" fontWeight="500">
              {formattedTime}
            </Text>
            <Separator vertical />
            <View p="$2" borderRadius={20} bg={COLORS.primary}>
              <Text fontSize="$3" fontWeight="bold" color={COLORS.textOnDark}>
                {walk.durationMinutes} min
              </Text>
            </View>
          </XStack>
        </XStack>
      </YStack>

      <Separator />

      {/* ZONE 2: Location Actions */}
      <Card.Footer p="$4">
        <YStack gap="$4" width="100%">
          {/* Location with Maps button */}
          <XStack gap="$3" alignItems="center" justifyContent="space-between">
            <XStack gap="$2" alignItems="center" flex={1}>
              <View style={styles.iconContainer}>
                <MapPin size="$1.5" color={COLORS.primary} />
              </View>
              <Text fontSize="$4" fontWeight="600" flex={1} color="#333">
                {walk.location?.name || "Location TBD"}
              </Text>
            </XStack>

            {walk.location?.latitude && walk.location?.longitude && (
              <Button
                size="$3"
                backgroundColor={COLORS.background}
                borderColor={COLORS.primary}
                borderWidth={1}
                color={COLORS.primary}
                onPress={
                  Platform.OS === "ios" ? openInAppleMaps : openInGoogleMaps
                }
                borderRadius={12}
                paddingHorizontal="$3"
                hoverStyle={styles.buttonHover}
                pressStyle={styles.buttonPress}
                icon={<Map size="$1" color={COLORS.primary} />}
                iconAfter={<ExternalLink />}
              >
                Open
              </Button>
            )}
          </XStack>

          {/* RSVP Button */}
          {!isMine && !isPast && isUpcoming && (
            <Button
              backgroundColor={COLORS.action}
              color={COLORS.textOnDark}
              borderColor={COLORS.action}
              borderWidth={1}
              onPress={handleRSVP}
              marginTop="$2"
              fontWeight="bold"
              size="$3"
              borderRadius={12}
              hoverStyle={styles.actionButtonHover}
              pressStyle={styles.actionButtonPress}
              iconAfter={isRSVPed ? <Check size="$1" /> : undefined}
            >
              {isRSVPed ? "RSVP'd" : `Join ${walk.organizerName} Now!`}
            </Button>
          )}
        </YStack>
      </Card.Footer>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    marginVertical: 8,
    borderWidth: 0,
    padding: 0,
  },
  cardPress: {
    scale: 0.98,
    opacity: 0.9,
  },
  cardHover: {
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  bannerContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  banner: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  hostBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: "flex-start",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "white",
  },
  buttonHover: {
    scale: 1.02,
    opacity: 0.9,
  },
  buttonPress: {
    scale: 0.98,
    opacity: 0.8,
  },
  actionButtonHover: {
    scale: 1.03,
    backgroundColor: `${COLORS.action}F0`,
  },
  actionButtonPress: {
    scale: 0.98,
    backgroundColor: `${COLORS.action}E0`,
  },
});
