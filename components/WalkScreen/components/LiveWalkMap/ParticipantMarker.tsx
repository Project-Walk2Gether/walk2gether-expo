import React from "react";
import { Marker } from "react-native-maps";

interface Props {
  id: string;
  displayName: string | undefined;
  latitude: number;
  longitude: number;
}

export default function ParticipantMarker({
  id,
  displayName,
  latitude,
  longitude,
}: Props) {
  return (
    <Marker
      key={id}
      coordinate={{
        latitude,
        longitude,
      }}
      tracksViewChanges={false}
      title={displayName || "Participant"}
      description="Participant location"
      pinColor="#2196F3"
    />
  );
}
