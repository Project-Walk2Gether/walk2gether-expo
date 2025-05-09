import React from "react";
import { ViewStyle } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
  Place,
} from "react-native-google-places-autocomplete";
import { Text, View, YStack } from "tamagui";

export interface PlaceData {
  name: string;
  placeId: string;
  latitude: number;
  longitude: number;
}

interface PlacesAutocompleteProps {
  value?: PlaceData | null;
  onSelect: (location: PlaceData) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  touched?: boolean;
  googleApiKey: string;
  containerStyle?: ViewStyle;
  withLabel?: boolean;
  required?: boolean;
}

export const PlacesAutocomplete = React.forwardRef<
  GooglePlacesAutocompleteRef,
  PlacesAutocompleteProps
>(
  (
    {
      value,
      onSelect,
      placeholder = "Search for a location",
      label,
      error,
      touched,
      googleApiKey,
      containerStyle,
      withLabel,
      required = false,
    },
    ref
  ) => {
    // Set the input value to value.name on layout
    const handleLayout = () => {
      if (value?.name) {
        console.log("setting name", { name: value.name });
        ref?.current?.setAddressText(value.name);
      }
    };

    return (
      <YStack marginBottom="$5" {...containerStyle}>
        {withLabel && (
          <Text
            fontSize="$4"
            fontWeight="500"
            marginBottom="$1"
            color="$gray11"
          >
            {label}
            {required && <Text color="red"> *</Text>}
          </Text>
        )}
        <View onLayout={handleLayout}>
          <GooglePlacesAutocomplete
            ref={ref}
            placeholder={placeholder}
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (details) {
                onSelect({
                  name: data.description,
                  placeId: data.place_id,
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                });
              }
            }}
            query={{
              key: googleApiKey,
            }}
            predefinedPlaces={
              value?.name
                ? [
                    {
                      description: value.name,
                      // Converting to the format expected by the component
                      geometry: {
                        location: {
                          latitude: value.latitude,
                          longitude: value.longitude,
                        },
                      },
                    } as unknown as Place,
                  ]
                : []
            }
            styles={{
              container: {
                flex: 0,
              },
              textInputContainer: {
                backgroundColor: "rgba(0,0,0,0)",
                borderTopWidth: 0,
                borderBottomWidth: 0,
              },
              textInput: {
                marginLeft: 0,
                marginRight: 0,
                height: 45,
                color: "#5d5d5d",
                fontSize: 16,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 8,
                backgroundColor: "#f9f9f9",
              },
              predefinedPlacesDescription: {
                color: "#1faadb",
              },
              listView: {
                backgroundColor: "white",
                borderRadius: 8,
                marginTop: 5,
                zIndex: 10,
              },
              row: {
                zIndex: 10,
              },
            }}
          />
        </View>
        {error && touched && (
          <Text color="red" fontSize="$2" marginTop="$1">
            {error}
          </Text>
        )}
      </YStack>
    );
  }
);
