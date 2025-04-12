import { COLORS } from "@/styles/colors";
import { deleteDoc, doc } from "@react-native-firebase/firestore";
import {
  Calendar,
  Check,
  Clock,
  Map,
  MapPin,
  MoreVertical,
  Navigation,
  User,
} from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Platform, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Popover,
  Separator,
  Text,
  XStack,
  YStack,
} from "tamagui";
import { Walk } from "walk2gether-shared";
import { db } from "../config/firebase";
import { getWalkTypeData } from "../constants/walkTypes";
import { useAuth } from "../context/AuthContext";
import { useWalks } from "../context/WalksContext.bak";

interface WalkCardProps {
  walk: Walk;
}

export default function WalkCard({ walk }: WalkCardProps) {
  const { hasUserRSVPed, rsvpForWalk, cancelRSVP } = useWalks();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const isRSVPed = hasUserRSVPed(walk.id || "");
  const walkDate = walk.date?.toDate() || new Date();
  const formattedDate = format(walkDate, "EEE, MMM d");
  const formattedTime = format(walkDate, "h:mm a");
  const now = new Date();
  const isToday = walkDate.toDateString() === now.toDateString();
  const isPast = walkDate < now;
  const isUpcoming = !isPast;
  const isMine = user?.uid === walk.createdByUid;
  const [mapsMenuOpen, setMapsMenuOpen] = useState(false);

  const handleRSVP = async () => {
    if (!walk.id) return;

    if (isRSVPed) {
      await cancelRSVP(walk.id);
    } else {
      await rsvpForWalk(walk.id);
    }
  };

  // Tap functionality disabled
  const handlePress = () => {
    // Do nothing when card is tapped
  };

  const handleEdit = () => {
    setMenuOpen(false);
    if (walk.id) {
      router.push(`/edit-walk/${walk.id}`);
    }
  };

  const handleDelete = () => {
    setMenuOpen(false);
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
  const walkIcon = <IconComponent size="$3" color="white" />;

  // Functions to open maps
  const openInGoogleMaps = () => {
    setMapsMenuOpen(false);
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
    setMapsMenuOpen(false);
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

  console.log({ isMine, isPast, isUpcoming });

  return (
    <Card
      size="$4"
      animation="bouncy"
      overflow="hidden"
      backgroundColor="white"
      style={styles.card}
    >
      {/* Walk type banner */}
      <View style={styles.bannerContainer}>
        <LinearGradient
          colors={walkTypeData.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.banner, styles.bannerBorderRadius]}
        >
          <XStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <XStack alignItems="center" gap="$2">
              {walkIcon}
              <Text color="white" fontWeight="600">
                {walkTypeData.label}
              </Text>
            </XStack>

            {/* Owner Menu */}
            {isCreator && (
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <Popover.Trigger asChild>
                  <Button
                    size="$2"
                    circular
                    chromeless
                    onPress={() => setMenuOpen(true)}
                    icon={<MoreVertical size="$1" color="white" />}
                  />
                </Popover.Trigger>

                <Popover.Content
                  padding="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  enterStyle={{ y: -10, opacity: 0 }}
                  exitStyle={{ y: -10, opacity: 0 }}
                  animation={[
                    "quick",
                    { opacity: { overshootClamping: true } },
                  ]}
                  elevate
                >
                  <YStack gap="$2">
                    <Button size="$3" onPress={handleEdit}>
                      Edit Walk
                    </Button>
                    <Button size="$3" theme="red" onPress={handleDelete}>
                      Cancel Walk
                    </Button>
                  </YStack>
                </Popover.Content>
              </Popover>
            )}
          </XStack>
        </LinearGradient>
      </View>

      <Card.Header paddingHorizontal="$4" paddingVertical="$3">
        <XStack justifyContent="space-between" alignItems="center" width="100%">
          <XStack alignItems="center" gap="$2">
            <Calendar size="$1.5" color={COLORS.primary} />
            <Text color="#333" fontWeight="bold" fontSize="$5">
              {isToday ? "Today" : formattedDate}
            </Text>
          </XStack>

          <XStack alignItems="center" gap="$2">
            <Clock size="$1.5" color={COLORS.primary} />
            <Text color="#333" fontSize="$5" fontWeight="500">
              {formattedTime}
            </Text>
          </XStack>
        </XStack>
      </Card.Header>

      <Card.Footer paddingHorizontal="$4" paddingVertical="$3">
        <Separator marginBottom="$2" />

        <YStack gap="$3" width="100%">
          {/* Location with Maps button */}
          <XStack gap="$2" alignItems="center" justifyContent="space-between">
            <XStack gap="$2" alignItems="center" flex={1}>
              <View style={styles.iconContainer}>
                <MapPin size="$1.5" color={COLORS.primary} />
              </View>
              <Text fontSize="$4" fontWeight="500" flex={1} color="#333">
                {walk.location?.name || "Location TBD"}
              </Text>
            </XStack>

            {walk.location?.latitude && walk.location?.longitude && (
              <Popover open={mapsMenuOpen} onOpenChange={setMapsMenuOpen}>
                <Popover.Trigger asChild>
                  <Button
                    size="$2"
                    backgroundColor={COLORS.background}
                    borderColor={COLORS.primary}
                    borderWidth={1}
                    color={COLORS.primary}
                    onPress={() => setMapsMenuOpen(true)}
                    borderRadius={8}
                    paddingHorizontal="$2"
                    icon={<Map size="$1" color={COLORS.primary} />}
                  >
                    Maps
                  </Button>
                </Popover.Trigger>

                <Popover.Content
                  padding="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  enterStyle={{ y: -10, opacity: 0 }}
                  exitStyle={{ y: -10, opacity: 0 }}
                  animation={[
                    "quick",
                    { opacity: { overshootClamping: true } },
                  ]}
                  elevate
                >
                  <YStack gap="$2" width={180}>
                    <Button
                      size="$3"
                      onPress={openInGoogleMaps}
                      icon={<Navigation size="$1" color={COLORS.action} />}
                    >
                      Google Maps
                    </Button>
                    <Button
                      size="$3"
                      onPress={openInAppleMaps}
                      icon={<Map size="$1" color={COLORS.action} />}
                    >
                      {Platform.OS === "ios" ? "Apple Maps" : "Maps"}
                    </Button>
                  </YStack>
                </Popover.Content>
              </Popover>
            )}
          </XStack>

          {/* Host and Duration */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$2" alignItems="center">
              <View style={styles.iconContainer}>
                <User size="$1.5" color={COLORS.primary} />
              </View>
              <Text fontSize="$3" fontWeight="500" color="#555">
                {walk.organizerName || "Host"}
              </Text>
            </XStack>
            <XStack
              gap="$2"
              alignItems="center"
              backgroundColor={`${COLORS.primary}15`}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius={8}
            >
              <Clock size="$1" color={COLORS.primary} />
              <Text fontSize="$3" fontWeight="600" color={COLORS.primary}>
                {walk.durationMinutes} min
              </Text>
            </XStack>
          </XStack>

          {/* RSVP Button */}
          {!isMine && !isPast && isUpcoming && (
            <Button
              backgroundColor={COLORS.action}
              color={COLORS.textOnDark}
              borderColor={COLORS.action}
              borderWidth={1}
              onPress={handleRSVP}
              marginTop="$3"
              fontWeight="bold"
              size="$3"
              borderRadius={10}
              iconAfter={isRSVPed ? <Check size="$1" /> : undefined}
            >
              {isRSVPed ? "RSVP'd" : `Join ${walk.organizerName} Now!`}
            </Button>
          )}

          {/* Host indicator */}
          {isMine && (
            <View
              style={[styles.hostBadge, { backgroundColor: COLORS.primary }]}
            >
              <Text fontSize="$2" fontWeight="600" color={COLORS.textOnDark}>
                YOU'RE HOSTING
              </Text>
            </View>
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
    marginVertical: 6,
    borderWidth: 0,
  },
  bannerContainer: {
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
  },
  bannerBorderRadius: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  hostBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
});
