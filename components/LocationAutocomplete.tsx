import {
  PlaceData,
  PlacesAutocomplete,
} from "@/components/UI/PlacesAutocomplete";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { COLORS } from "@/styles/colors";
import { ArrowLeft } from "@tamagui/lucide-icons";
import React, { useRef } from "react";
import { Keyboard } from "react-native";
import { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { Button, Text, YStack } from "tamagui";

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
  placeholder = "Search for your city",
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
      // TypeScript expects a number for width in ViewStyle
      width: "100%" as any,
    },
    textInputContainer: {
      backgroundColor: "transparent",
      borderTopWidth: 0,
      borderBottomWidth: 0,
      width: "100%",
      paddingHorizontal: 0,
      marginTop: 0,
      marginLeft: 0,
      marginRight: 0,
    },
    textInput: {
      width: "100%",
      borderColor: touched.location && errors.location ? COLORS.error : COLORS.primary,
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 16,
      height: 40, // Match Tamagui Input default height
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
    const locationData = {
      name: placeData.name,
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
    <YStack space="$2" marginBottom="$5">
      <PlacesAutocomplete
        ref={placesAutocompleteRef}
        placeholder={placeholder}
        value={placeDataValue}
        onSelect={handlePlaceSelect}
        googleApiKey={GOOGLE_MAPS_API_KEY}
        // Pass comprehensive styles to match FormInput appearance
        containerStyle={styles.container}
        textInputProps={{
          autoComplete: "off",
          selectionColor: COLORS.primary,
          returnKeyType: "search",
          style: styles.textInput,
          placeholderTextColor: "#AAA",
        }}
      />
      {touched.location && errors.location && (
        <Text color="$red10" fontSize="$2">
          {errors.location}
        </Text>
      )}
      {(value && includeChooseAnotherWayButton || !value) && (
        <Button
          size="$4"
          mt="$2"
          variant="outlined"
          onPress={() => {
            if (value) setFieldValue("location", null);
            onCancel?.();
          }}
          f={2}
          icon={
            <ArrowLeft
              size={20}
              style={{ marginRight: 8 }}
            />
          }
        >
          Choose another way
        </Button>
      )}
    </YStack>
  );
};

export default LocationAutocomplete;
