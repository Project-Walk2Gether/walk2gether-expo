import { COLORS } from "@/styles/colors";
import { ArrowLeft } from "@tamagui/lucide-icons";
import React, { useRef } from "react";
import { Keyboard } from "react-native";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { PlacesAutocomplete, PlaceData } from "@/components/UI/PlacesAutocomplete";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { Button, Text, YStack } from "tamagui";

interface LocationAutocompleteProps {
  value: any;
  setFieldValue: (field: string, value: any) => void;
  showLocationResults: boolean;
  setShowLocationResults: (show: boolean) => void;
  touched: any;
  errors: any;
  placeholder?: string;
  onCancel: () => void;
  includeChooseAnotherWayButton?: boolean;
}

const LocationAutocomplete: React.FC<
  Omit<LocationAutocompleteProps, "styles">
> = ({
  value,
  setFieldValue,
  showLocationResults,
  setShowLocationResults,
  touched,
  onCancel,
  errors,
  placeholder = "Search for your city",
  includeChooseAnotherWayButton,
}) => {
  const placesAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  // Create a reference to the current location data if it exists
  const placeDataValue = value ? {
    name: value.name || '',
    placeId: value.placeId || '',
    latitude: value.latitude || 0,
    longitude: value.longitude || 0,
    description: value.name || '',
  } : null;

  // Custom styles for the text input
  const textInputStyles = {
    width: "100%",
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    height: 48,
    borderWidth: 1,
  };

  // Handle focus event
  const handleFocus = () => {
    setShowLocationResults(true);
  };

  // Handle selection of a place
  const handlePlaceSelect = (placeData: PlaceData) => {
    const locationData = {
      name: placeData.name,
      placeId: placeData.placeId,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
    };
    
    setFieldValue("location", locationData);
    setShowLocationResults(false);
    
    setTimeout(() => {
      if (placesAutocompleteRef.current && 'setAddressText' in placesAutocompleteRef.current) {
        placesAutocompleteRef.current.setAddressText(placeData.name);
        Keyboard.dismiss();
      }
    }, 100);
  };

  return (
    <YStack space="$2">
      <PlacesAutocomplete
        ref={placesAutocompleteRef}
        placeholder={placeholder}
        value={placeDataValue}
        onSelect={handlePlaceSelect}
        googleApiKey={GOOGLE_MAPS_API_KEY}
        textInputStyles={textInputStyles}
        textInputProps={{
          onFocus: handleFocus,
          autoComplete: "off",
          onBlur: () => {
            setTimeout(() => {
              if (value) {
                setShowLocationResults(false);
              }
            }, 200);
          },
        }}
      />
      {touched.location && errors.location && (
        <Text color="$red10" fontSize="$2">
          {errors.location}
        </Text>
      )}
      {value && includeChooseAnotherWayButton && (
        <Button
          size="$3"
          mt="$2"
          backgroundColor="$gray2"
          borderRadius={8}
          fontWeight="600"
          fontSize="$4"
          py="$2"
          color="$gray12"
          icon={ArrowLeft}
          onPress={() => {
            setFieldValue("location", null);
            setShowLocationResults(false);
            onCancel();
          }}
        >
          Choose another way
        </Button>
      )}
      {!value && (
        <Button
          size="$3"
          mt="$2"
          backgroundColor="$gray2"
          borderRadius={8}
          fontWeight="600"
          fontSize="$4"
          py="$2"
          color="$gray12"
          icon={ArrowLeft}
          onPress={() => {
            onCancel();
            setShowLocationResults(false);
          }}
        >
          Choose another way
        </Button>
      )}
    </YStack>
  );
};

export default LocationAutocomplete;
