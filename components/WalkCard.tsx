import { Calendar, Hand, Pin, Timer, User, Users } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Linking } from "react-native";
import {
  Avatar,
  Button,
  Card,
  SizableText,
  Spacer,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "../context/LocationContext";
import { getDistanceMeters, formatDistance } from "../utils/geo";
import { useWalks } from "../context/WalksContext";
import { COLORS } from "../styles/colors";
import { useDoc, useQuery } from "../utils/firestore";
import { isActive, isFuture, isPast } from "../utils/walkUtils";
import WalkCardHeader from "./WalkCard/WalkCardHeader";

// Props interface for WalkCard
interface WalkCardProps {
  walk: WithId<Walk>;
}

const WalkCard: React.FC<WalkCardProps> = ({ walk }) => {
  const { coords, loading: locationLoading, error: locationError } = useLocation();
  const { user } = useAuth();
  const isMine = user?.uid === walk.createdByUid;
  const { docs: participants } = useQuery<Participant>(
    walk._ref.collection("participants")
  );
  const unapprovedCount = participants.filter((p) => !p.approvedAt).length;
  const maxAvatars = 4;
  const avatars = participants.slice(0, maxAvatars);
  const overflow = participants.length - maxAvatars;
  const organizerName = isMine ? "You're hosting" : walk.organizerName;
  const { hasUserRSVPed } = useWalks();
  const router = useRouter();
  const walkDate = walk.date?.toDate() || new Date();
  const now = new Date();

  // Calculate end time of the walk based on start time and duration
  const walkEndTime = new Date(walkDate);
  walkEndTime.setMinutes(
    walkEndTime.getMinutes() + (walk.durationMinutes || 0)
  );

  // A walk is active if it has started but not yet ended
  const isActive = walkDate <= now && now <= walkEndTime;
  const isPast = walkEndTime < now;
  const isUpcoming = walkDate > now;

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

  let distanceFromMe = null;
if (
  walk.location?.latitude != null &&
  walk.location?.longitude != null &&
  coords?.latitude != null &&
  coords?.longitude != null
) {
  const meters = getDistanceMeters(
    coords.latitude,
    coords.longitude,
    walk.location.latitude,
    walk.location.longitude
  );
  distanceFromMe = formatDistance(meters);
} else if (locationLoading) {
  distanceFromMe = "Locating...";
} else if (locationError) {
  distanceFromMe = "Location unavailable";
} else {
  distanceFromMe = "-";
}

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
      <WalkCardHeader isMine={isMine} walk={walk} />
      <XStack>
        <YStack
          f={1}
          justifyContent="center"
          alignItems="flex-start"
          padding={12}
        >
          {isMine ? (
            <>
              <Spacer flexGrow={1} />
              <XStack w="100%">
                <XStack
                  backgroundColor={COLORS.primary}
                  borderRadius={99}
                  px={12}
                  py={5}
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
              </XStack>
            </>
          ) : (
            <XStack alignItems="center" gap={4}>
              <User size={22} />
              <Text fontSize={16} fontWeight="bold">
                {organizerName}
              </Text>
            </XStack>
          )}
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
          {
            <XStack alignItems="center" gap={4}>
              <Pin size={14} />
              <SizableText size="$2">
                {walkIsNeighborhoodWalk(walk)
                  ? distanceFromMe
                  : walk.location.name}
              </SizableText>
            </XStack>
          }
        </YStack>
      </XStack>
      {/* Actions footer */}
      <XStack py="$3" alignItems="center" gap="$2" paddingHorizontal={12}>
        <XStack alignItems="center" gap={-20}>
          {avatars.map((p, idx) => (
            <Avatar
              key={p.id}
              circular
              size={48}
              borderWidth={2}
              borderColor="#fff"
              marginLeft={idx === 0 ? 0 : -32}
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
        {isMine && unapprovedCount > 0 ? (
          <UnapprovedRequestsRow
            walkId={walk.id}
            unapprovedCount={unapprovedCount}
          />
        ) : (
          <PeopleCountText walk={walk} participants={participants} />
        )}
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

interface PeopleCountTextProps {
  walk: Walk;
  participants: Participant[];
}

const PeopleCountText: React.FC<PeopleCountTextProps> = ({
  walk,
  participants,
}) => {
  let peopleText = "";
  const count = participants.length;
  if (isActive(walk)) {
    peopleText = `${count} ${count === 1 ? "person" : "people"} walking`;
  } else if (isFuture(walk)) {
    peopleText = `${count} ${count === 1 ? "person" : "people"} going`;
  } else if (isPast(walk)) {
    peopleText = `${count} ${count === 1 ? "person" : "people"} joined`;
  } else {
    peopleText = `${count} ${count === 1 ? "person" : "people"}`;
  }
  return (
    <Text flexGrow={1} fontWeight="600" fontSize={14} color="#333">
      {peopleText}
    </Text>
  );
};

interface UnapprovedRequestsRowProps {
  walkId: string;
  unapprovedCount: number;
}

const UnapprovedRequestsRow: React.FC<UnapprovedRequestsRowProps> = ({
  walkId,
  unapprovedCount,
}) => {
  const router = useRouter();
  return (
    <XStack flexShrink={1} alignItems="center" gap={8} py={4}>
      <Text flexGrow={1} fontWeight="600" fontSize={13} color="#e67e22">
        {unapprovedCount}{" "}
        {unapprovedCount === 1 ? "person wants" : "people want"} to join
      </Text>
      <Button
        size="$2"
        backgroundColor="#e67e22"
        color="white"
        onPress={() => router.push(`/walk/${walkId}/waiting-room`)}
        borderRadius={8}
        px={12}
        py={4}
      >
        <Text color="white" fontWeight="bold" fontSize={13}>
          See requests
        </Text>
      </Button>
    </XStack>
  );
};

export default WalkCard;
