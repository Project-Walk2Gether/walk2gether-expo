import { deleteDoc, doc } from "@react-native-firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, StyleSheet } from "react-native";
import { Text, View, XStack } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import { db } from "../../config/firebase";
import { getWalkTypeData } from "../../constants/walkTypes";
import { COLORS } from "../../styles/colors";
import { isActive, isFuture } from "../../utils/walkUtils";
import WalkMenu from "../WalkMenu";

interface WalkCardHeaderProps {
  walk: WithId<Walk>;
  isMine: boolean;
}

const WalkCardHeader: React.FC<WalkCardHeaderProps> = ({ walk, isMine }) => {
  // Get walk type styling from shared constants
  const walkTypeData = getWalkTypeData(walk.type);

  const router = useRouter();

  // Create the icon element with consistent styling
  const IconComponent = walkTypeData.icon;
  const walkIcon = <IconComponent size={20} color="white" />;

  const active = isActive(walk);
  const future = isFuture(walk);

  let headerBadge: React.ReactNode = null;
  if (active) {
    headerBadge = (
      <XStack
        backgroundColor="white"
        borderRadius={99}
        px={12}
        py={5}
        alignItems="center"
        justifyContent="center"
        minWidth={0}
        borderWidth={2}
        borderColor={walkTypeData.gradient[0]}
      >
        <Text fontSize={12} fontWeight="bold" color={COLORS.text}>
          Happening now!
        </Text>
      </XStack>
    );
  } else if (future && walk.date) {
    headerBadge = (
      <XStack
        backgroundColor="white"
        borderRadius={99}
        px={12}
        py={5}
        alignItems="center"
        justifyContent="center"
        minWidth={0}
        borderWidth={2}
        borderColor={walkTypeData.gradient[0]}
      >
        <Text fontSize={12} fontWeight="bold" color={COLORS.text}>
          {(() => {
            const raw = formatDistanceToNow(walk.date.toDate(), {
              addSuffix: false,
            });
            return `in ${raw
              .replace(/hours?/g, "hrs")
              .replace(/minutes?/g, "min")
              .replace(/seconds?/g, "sec")
              .replace(/days?/g, "d")
              .replace(/weeks?/g, "w")
              .replace(/months?/g, "mo")
              .replace(/years?/g, "y")
              .replace(/about /g, "")
              .replace(/less than /g, "< ")}`;
          })()}
        </Text>
      </XStack>
    );
  } // No header for past walks

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

  return (
    <LinearGradient
      colors={walkTypeData.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
      }}
    >
      <View style={styles.bannerOverlay} pointerEvents="none" />
      <XStack
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        pl="$3"
        pr="$2"
        py="$3"
        gap="$2"
      >
        <XStack flexShrink={1} alignItems="center" gap="$1">
          <XStack flexShrink={1} alignItems="center" gap="$2">
            {walkIcon}
            <Text
              flexShrink={1}
              flexGrow={1}
              color="white"
              fontWeight="bold"
              fontSize={14}
            >
              {walkTypeData.label}
            </Text>
          </XStack>

          {headerBadge}
        </XStack>
        {isMine && <WalkMenu onEdit={handleEdit} onDelete={handleDelete} />}
      </XStack>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
});

export default WalkCardHeader;
