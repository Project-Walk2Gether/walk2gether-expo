import React from "react";
import { Marker } from "react-native-maps";
import { View } from "tamagui";

interface Props {
  id: string;
  displayName: string | undefined;
  latitude: number;
  longitude: number;
  isCurrentUser: boolean;
}

export default function ParticipantMarker({
  id,
  displayName,
  latitude,
  longitude,
  isCurrentUser,
}: Props) {
  return isCurrentUser ? (
    // Blue dot for current user location
    <Marker
      tracksViewChanges={false}
      key={id}
      coordinate={{
        latitude,
        longitude,
      }}
      title={displayName || "You"}
      description="Your current location"
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        height={24}
        width={24}
        borderRadius={12}
        backgroundColor="#2196F3" // Blue color
        borderWidth={3}
        borderColor="white"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.3}
        shadowRadius={4}
        elevation={4}
      />
    </Marker>
  ) : (
    // Regular pin marker for other participants
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
