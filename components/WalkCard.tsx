import { deleteDoc, doc } from "@react-native-firebase/firestore";
import { Calendar, Hand, Pin, Timer, User, Users } from "@tamagui/lucide-icons";
import { getWalkTypeData } from "constants/walkTypes";
import { useAuth } from "context/AuthContext";
import { useWalks } from "context/WalksContext";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import pluralize from "pluralize";
import React from "react";
import { Alert, Linking, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { COLORS } from "styles/colors";
import {
  Avatar,
  Button,
  Card,
  SizableText,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useDoc, useQuery } from "utils/firestore";
import { Participant, Walk, WithId } from "walk2gether-shared";
import WalkCardHeader from "./WalkCard/WalkCardHeader";

// Props interface for WalkCard
interface WalkCardProps {
  walk: WithId<Walk>;
}

const WalkCard: React.FC<WalkCardProps> = ({ walk }) => {
  const { docs: participants } = useQuery<Participant>(
    walk._ref.collection("participants")
  );
  const maxAvatars = 4;
  const avatars = participants.slice(0, maxAvatars);
  const overflow = participants.length - maxAvatars;

  const organizerName = isMine ? "You're hosting" : walk.organizerName;

  const { hasUserRSVPed } = useWalks();
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
      borderRadius={14}
      backgroundColor="#fff"
      shadowColor="#000"
      shadowOpacity={0.06}
      shadowRadius={8}
      shadowOffset={{ width: 0, height: 2 }}
      marginVertical={10}
      pressStyle={{ scale: 0.98 }}
      borderTopLeftRadius={18}
      borderTopRightRadius={18}
      animation="bouncy"
    >
      <WalkCardHeader
        isCreator={isMine}
        walkIcon={walkIcon}
        walkTypeData={walkTypeData}
      />
      {/* Hero Row */}
      <XStack height={120}>
        {/* Left: Static Map */}
        <View f={1}>
          <MapView
            style={{ width: "100%", height: "100%" }}
            initialRegion={{
              latitude: walk.location.latitude,
              longitude: walk.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: walk.location.latitude,
                longitude: walk.location.longitude,
              }}
              title={walk.location.name}
            />
          </MapView>
          <LinearGradient
            colors={["rgba(0,0,0,0.25)", "transparent"]}
            style={StyleSheet.absoluteFillObject}
          ></LinearGradient>
        </View>
        {/* Right: Walk meta */}
        <YStack
          f={1}
          justifyContent="center"
          alignItems="flex-start"
          padding={12}
        >
          <XStack alignItems="center" gap={4}>
            <Calendar size={14} />
            <SizableText size="$2">
              {format(walk.date.toDate(), "EEE MMM d, h:mm a")}
            </SizableText>
          </XStack>
          <XStack alignItems="center" gap={4}>
            <Timer size={14} />
            <SizableText size="$2">{walk.durationMinutes} min</SizableText>
          </XStack>
          <XStack alignItems="center" gap={4}>
            <Pin size={14} />
            <SizableText size="$2">{walk.location.name}</SizableText>
          </XStack>
          <XStack alignItems="center" gap={4}>
            {isMine ? (
              <XStack
                backgroundColor={COLORS.primary}
                borderRadius={99}
                px={12}
                py={5}
                mt="$2"
                alignItems="center"
                justifyContent="center"
                minWidth={0}
                gap="$2"
              >
                <User color="white" size={14} />
                <Text
                  fontSize={12}
                  color={COLORS.textOnDark}
                  fontWeight="bold"
                  numberOfLines={1}
                >
                  You're hosting
                </Text>
              </XStack>
            ) : (
              <>
                <User size={14} />
                <SizableText size="$2">{organizerName}</SizableText>
              </>
            )}
          </XStack>
        </YStack>
      </XStack>
      {/* Actions footer */}
      <XStack py="$3" alignItems="center" gap="$2" paddingHorizontal={12}>
        <XStack alignItems="center" gap={-10}>
          {avatars.map((p, idx) => (
            <Avatar
              key={p.id}
              circular
              size={36}
              borderWidth={2}
              borderColor="#fff"
              marginLeft={idx === 0 ? 0 : -10}
            >
              {p.photoURL ? (
                <Avatar.Image src={p.photoURL} />
              ) : (
                <Avatar.Fallback
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="#eee"
                >
                  <Users size={18} color="#aaa" />
                </Avatar.Fallback>
              )}
            </Avatar>
          ))}
          {overflow > 0 && (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#eee",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: -10,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            >
              <Text
                fontWeight="600"
                color="#888"
                fontSize={14}
              >{`+${overflow}`}</Text>
            </View>
          )}
        </XStack>
        <Text flexGrow={1}>
          {pluralize("person", participants.length, true)} walking
        </Text>
        {isMine ? null : (
          <Button
            backgroundColor={COLORS.primary}
            icon={<Hand color="white" />}
            size="$3"
            onPress={handlePress}
          >
            <Text fontSize={12} fontWeight="bold" color="white">
              Ask to join
            </Text>
          </Button>
        )}
      </XStack>
    </Card>
  );
};

export default WalkCard;
