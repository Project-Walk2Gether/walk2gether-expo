import React from "react";
import { View } from "react-native";
import { H3 } from "tamagui";
import { Walk } from "walk2gether-shared";

interface Props {
  walk: Walk;
  onPress: () => void;
}

export default function WalkHistoryItem({ walk, onPress }: Props) {
  // Handle potentially missing fields with defaults
  const walkDate = walk.date?.toDate() || new Date();
  const durationMinutes = walk.durationMinutes || 30;

  return (
    <View onPress={onPress}>
      <H3>Walk</H3>
    </View>
  );

  // return (
  //   <TouchableOpacity
  //     style={styles.walkItem}
  //     onPress={() => navigateToWalkDetails(walk.id)}
  //   >
  //     <View style={styles.walkDate}>
  //       <Text style={styles.dateText}>{format(walkDate, "MMM d")}</Text>
  //       <Text style={styles.yearText}>{format(walkDate, "yyyy")}</Text>
  //     </View>
  //     <View style={styles.walkInfo}>
  //       <Text style={styles.walkTitle}>{walkName}</Text>
  //       <Text style={styles.timeText}>
  //         {format(walkDate, "h:mm a")} • {durationMinutes} min
  //       </Text>
  //       <Text style={styles.partnerText}>{participantsText}</Text>
  //       {rotations.length > 1 && (
  //         <Text style={styles.rotationsText}>{rotations.length} rotations</Text>
  //       )}
  //     </View>
  //     <View style={styles.iconContainer}>
  //       <Ionicons name="chevron-forward" size={20} color="#666" />
  //     </View>
  //   </TouchableOpacity>
}
