import { deleteDoc, doc } from "@react-native-firebase/firestore";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Linking } from "react-native";
import { Card } from "tamagui";
import { Participant, Walk } from "walk2gether-shared";
import { db } from "../../config/firebase";
import { getWalkTypeData } from "../../constants/walkTypes";
import { useAuth } from "../../context/AuthContext";
import { useWalks } from "../../context/WalksContext";
import { useDoc } from "../../utils/firestore";
import WalkCardFooter from "./WalkCardFooter";
import WalkCardHeader from "./WalkCardHeader";
import WalkCardTimeRow from "./WalkCardTimeRow";

interface WalkCardProps {
  walk: Walk;
}

export default function WalkCard({ walk }: WalkCardProps) {
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
      size="$4"
      animation="bouncy"
      overflow="hidden"
      backgroundColor="white"
      onPress={handlePress}
      p={0}
      m={0}
      borderTopLeftRadius={18}
      borderTopRightRadius={18}
    >
      <WalkCardHeader
        walkTypeData={walkTypeData}
        walkIcon={walkIcon}
        walk={walk}
        isMine={isMine}
        isActive={isActive}
        isPast={isPast}
        isCreator={isCreator}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        organizerName={walk.organizerName}
      />
      <WalkCardTimeRow
        formattedDate={formattedDate}
        formattedTime={formattedTime}
        walkEndTime={walkEndTime}
        walkDate={walkDate}
        durationMinutes={walk.durationMinutes}
        isToday={isToday}
      />
      <WalkCardFooter
        walk={walk}
        isMine={isMine}
        isPast={isPast}
        isUpcoming={isUpcoming}
        isRSVPed={isRSVPed}
        handleRSVP={handleRSVP}
        openInGoogleMaps={openInGoogleMaps}
        openInAppleMaps={openInAppleMaps}
      />
    </Card>
  );
}
