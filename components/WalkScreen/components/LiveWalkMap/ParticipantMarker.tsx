import ParticipantAvatar from "@/components/ParticipantAvatar";
import React from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";

interface Props {
  id: string;
  displayName: string | undefined;
  latitude: number;
  longitude: number;
  photoURL?: string | null;
}

export default function ParticipantMarker({
  id,
  displayName,
  latitude,
  longitude,
  photoURL,
}: Props) {
  // We'll always use a custom marker with avatar

  // Use a custom marker with avatar when photoURL is available
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
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Avatar with photo */}
        <ParticipantAvatar
          photoURL={photoURL}
          displayName={displayName}
          size="$3"
          borderColor="white"
          borderWidth={2}
        />
        
        {/* Shadow dot below the avatar */}
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.3)",
            marginTop: -4,
          }}
        />
      </View>
    </Marker>
  );
}
