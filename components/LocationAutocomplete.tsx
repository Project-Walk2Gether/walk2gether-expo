import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { COLORS } from "@/styles/colors";
import { extractDisplayName } from "@/utils/locationUtils";
import { ArrowLeft } from "@tamagui/lucide-icons";
import React, { useRef } from "react";
import { Keyboard } from "react-native";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { Button, Text, YStack } from "tamagui";
import { PlaceData, PlacesAutocomplete } from "./UI/PlacesAutocomplete";

interface Props {
  value: any;
  setFieldValue: (field: string, value: any) => void;
  touched: any;
  errors: any;
  placeholder?: string;
  onCancel?: () => void;
  includeChooseAnotherWayButton?: boolean;
}

const LocationAutocomplete: React.FC<Omit<Props, "styles">> = ({
  value,
  setFieldValue,
  touched,
  onCancel,
  errors,
  placeholder = "Enter your home address",
  includeChooseAnotherWayButton,
}) => {
  const placesAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  // Create a reference to the current location data if it exists
  const placeDataValue = value
    ? {
        name: value.name || "",
        placeId: value.placeId || "",
        latitude: value.latitude || 0,
        longitude: value.longitude || 0,
        description: value.name || "",
      }
    : null;

  // Comprehensive styles to match FormInput styling
  const styles = {
    container: {
      flex: 0,
      backgroundColor: "transparent",
      padding: 0,
      margin: 0,
      width: "100%" as const,
    },
    textInputContainer: {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      borderBottomWidth: 0,
      width: "100%" as const,
      paddingHorizontal: 0,
      marginTop: 0,
      marginLeft: 0,
      marginRight: 0,
    },
    textInput: {
      width: "100%",
      borderColor:
        touched.location && errors.location ? COLORS.error : COLORS.primary,
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      height: 44,
      borderWidth: 1,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    listView: {
      backgroundColor: COLORS.background,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.primary,
      marginTop: 5,
      zIndex: 10,
      overflow: "hidden",
    },
    row: {
      backgroundColor: COLORS.background,
      padding: 13,
      height: 44,
      flexDirection: "row",
    },
    description: {
      color: COLORS.text,
      fontSize: 14,
    },
    separator: {
      height: 0.5,
      backgroundColor: "#c8c7cc",
    },
    poweredContainer: {
      display: "none",
    },
  };

  // Handle selection of a place
  const handlePlaceSelect = (placeData: PlaceData) => {
    console.log("LocationAutocomplete - Received place data:", JSON.stringify(placeData, null, 2));
    
    const locationData = {
      name: placeData.name,
      displayName: extractDisplayName(
        placeData.addressComponents || [],
        placeData.formattedAddress
      ),
      placeId: placeData.placeId,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
    };

    setFieldValue("location", locationData);

    setTimeout(() => {
      if (
        placesAutocompleteRef.current &&
        "setAddressText" in placesAutocompleteRef.current
      ) {
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
        containerStyle={styles.container}
        textInputProps={{
          autoComplete: "off",
          selectionColor: COLORS.primary,
          returnKeyType: "search",
          style: styles.textInput,
          placeholderTextColor: COLORS.textMuted,
        }}
      />
      {touched.location && errors.location && (
        <Text color="$red10" fontSize="$2">
          {errors.location}
        </Text>
      )}
      {((value && includeChooseAnotherWayButton) || !value) && (
        <Button
          size="$4"
          mt="$2"
          variant="outlined"
          onPress={() => {
            if (value) setFieldValue("location", null);
            onCancel?.();
          }}
          f={2}
          icon={<ArrowLeft size={20} style={{ marginRight: 8 }} />}
        >
          Choose another way
        </Button>
      )}
    </YStack>
  );
};

export default LocationAutocomplete;
