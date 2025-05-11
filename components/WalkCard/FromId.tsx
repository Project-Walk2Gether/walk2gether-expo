import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import { getWalkStatus } from "@/utils/walkUtils";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Walk } from "walk2gether-shared";
import WalkCard from "./index";

interface WalkCardFromIdProps {
  walkId: string;
  showAttachments?: boolean;
}

/**
 * A component that fetches a walk by ID and renders a WalkCard
 * This simplifies usage in screens where we have the walk ID but need to fetch details
 */
export const WalkCardFromId: React.FC<WalkCardFromIdProps> = ({
  walkId,
  showAttachments = false,
}) => {
  // Use the useDoc hook to fetch the walk data by path
  const walkPath = `walks/${walkId}`;
  const { doc: walk, status: walkStatus } = useDoc<Walk>(walkPath);

  // Show loading state while fetching data
  if (walkStatus === "loading") {
    return (
      <View
        style={{
          height: 150,
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 10,
        }}
      >
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!walk) return null;

  const status = getWalkStatus(walk);
  // Render the walk card with the fetched data

  if (status === "past")
    return <WalkCard walk={walk} showAttachments={showAttachments} />;
};

export default WalkCardFromId;
