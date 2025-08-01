import React from "react";
import { Platform } from "react-native";
import { Marker } from "react-native-maps";
import { COLORS } from "../../../styles/colors";

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
      pinColor={COLORS.success}
      tracksViewChanges={Platform.OS === 'android'}
      title="Meetup Spot"
    />
  );
};

export default MeetupSpot;
