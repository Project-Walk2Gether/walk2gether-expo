import React from "react";
import { Polyline } from "react-native-maps";
import { ParticipantWithRoute } from "walk2gether-shared";
import { COLORS } from "@/styles/colors";

interface Props {
  participant: ParticipantWithRoute | null;
}

export default function UserRoute({ participant }: Props) {
  // Only render route if participant has route data
  if (
    !participant ||
    !participant.route ||
    !participant.route.points?.length
  ) {
    return null;
  }

  // Convert route points to map coordinates
  const polylineCoordinates = participant.route.points.map(
    (point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    })
  );

  return (
    <Polyline
      coordinates={polylineCoordinates}
      strokeWidth={4}
      strokeColor={COLORS.primary}
      lineDashPattern={[1, 3]} // Dashed line for user's route
    />
  );
}
