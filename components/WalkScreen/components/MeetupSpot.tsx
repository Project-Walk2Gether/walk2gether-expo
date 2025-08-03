import React from "react";
import { Platform } from "react-native";
import { Marker } from "react-native-maps";

interface Props {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    notes?: string;
    displayName?: string;
  };
  isWalkOwner?: boolean;
  walkId?: string;
}

const MeetupSpot: React.FC<Props> = ({ location }) => {
  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      pinColor={"rgba(0,153,255,0.9)"}
      tracksViewChanges={Platform.OS === "android"}
      title={location.notes || "Meetup Spot"}
    />
  );
};

export default MeetupSpot;
