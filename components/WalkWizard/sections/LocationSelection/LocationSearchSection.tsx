import { PlacesAutocomplete } from "@/components/UI/PlacesAutocomplete";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { COLORS } from "@/styles/colors";
import React from "react";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { View } from "tamagui";

interface Props {
  googlePlacesRef: React.RefObject<GooglePlacesAutocompleteRef>;
  onSelect: (data: any, details: any) => void;
}

const LocationSearchSection: React.FC<Props> = ({
  googlePlacesRef,
  onSelect,
}) => {
  return (
    <View zIndex={1}>
      <PlacesAutocomplete
        ref={googlePlacesRef}
        placeholder="Search for a location or long-press on map"
        onSelect={(data) =>
          onSelect(
            {
              description: data.name,
              structured_formatting: { main_text: data.name },
              place_id: data.placeId,
            },
            {
              geometry: {
                location: {
                  lat: data.latitude,
                  lng: data.longitude,
                },
              },
              formatted_address: data.description,
            }
          )
        }
        googleApiKey={GOOGLE_MAPS_API_KEY}
        textInputProps={{
          placeholderTextColor: COLORS.textMuted,
        }}
        textInputStyles={{
          borderRadius: 10,
          paddingHorizontal: 15,
          fontSize: 16,
        }}
      />
    </View>
  );
};

export default LocationSearchSection;
