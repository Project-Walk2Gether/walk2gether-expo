import React from "react";
import { Polyline } from "react-native-maps";
import { Walk } from "walk2gether-shared";

interface Props {
  walk: Walk | null;
}

export default function OfficialWalkRoute({ walk }: Props) {
  if (!walk?.route?.points?.length) return null;

  // Convert route points to map coordinates
  const polylineCoordinates = walk.route.points.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  return (
    <Polyline
      coordinates={polylineCoordinates}
      strokeWidth={5}
      strokeColor="#FF5E0E" // Use primary orange color with higher width for official route
      lineDashPattern={[0]} // Solid line
    />
  );
}
