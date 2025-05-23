import React, { useEffect } from "react";
import { ViewStyle } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
  Place,
} from "react-native-google-places-autocomplete";
import { Text, YStack } from "tamagui";

export interface PlaceData {
  name: string;
  placeId: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface Props {
  // Core props
  value?: PlaceData | null;
  onSelect: (location: PlaceData) => void;
  googleApiKey: string;

  // UI props
  placeholder?: string;
  label?: string;
  error?: string;
  touched?: boolean;
  containerStyle?: ViewStyle;
  withLabel?: boolean;
  required?: boolean;
  textInputStyles?: any;
  textInputProps?: any;
}

export const PlacesAutocomplete = React.forwardRef<
  GooglePlacesAutocompleteRef,
  Props
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
      textInputStyles,
      textInputProps = {},
    },
    ref
  ) => {
    // Set the input value when it changes
    useEffect(() => {
      if (value?.name && ref) {
        // Need to use timeout to ensure ref is available
        setTimeout(() => {
          if (ref && "current" in ref && ref.current) {
            ref.current.setAddressText(value.name);
          }
        }, 0);
      }
    }, [value, ref]);

    return (
      <YStack style={containerStyle || {}}>
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
        <GooglePlacesAutocomplete
          ref={ref}
          placeholder={placeholder}
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              onSelect({
                name:
                  data.description ||
                  data.structured_formatting?.main_text ||
                  "Selected Location",
                placeId: data.place_id || data.id,
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                description: data.description || details.formatted_address,
              });
            }
          }}
          query={{
            key: googleApiKey,
            language: "en",
          }}
          predefinedPlaces={
            value?.name
              ? [
                  {
                    description: value.name,
                    // Place_id is actually expected by the component internally
                    // but TypeScript definition is incorrect
                    place_id: value.placeId,
                    geometry: {
                      location: {
                        lat: value.latitude,
                        lng: value.longitude,
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
              marginBottom: 0,
            },
            textInput: {
              marginLeft: 0,
              marginRight: 0,
              height: 45,
              color: "#5d5d5d",
              marginBottom: 0,
              fontSize: 16,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              backgroundColor: "#f9f9f9",
              ...(textInputStyles || {}),
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
          // Bug fix: Explicitly set all required default props
          textInputProps={textInputProps}
          keyboardShouldPersistTaps="handled"
          enablePoweredByContainer={false}
          currentLocation={false}
          currentLocationLabel="Current location"
          debounce={0}
          disableScroll={false}
          enableHighAccuracyLocation={true}
          filterReverseGeocodingByTypes={[]}
          GooglePlacesDetailsQuery={{}}
          GooglePlacesSearchQuery={{
            rankby: "distance",
            type: "restaurant",
          }}
          GoogleReverseGeocodingQuery={{}}
          isRowScrollable={true}
          minLength={0}
          nearbyPlacesAPI="GooglePlacesSearch"
          numberOfLines={1}
          onFail={(e) => {
            console.warn("Google Place Failed : ", e);
          }}
          onNotFound={() => {}}
          onTimeout={() =>
            console.warn("google places autocomplete: request timeout")
          }
          predefinedPlacesAlwaysVisible={false}
          suppressDefaultStyles={false}
          textInputHide={false}
          timeout={20000}
          autoFillOnNotFound={false}
          isNewPlacesAPI={false}
          fields="*"
        />

        {error && touched && (
          <Text color="red" fontSize="$2" marginTop="$1">
            {error}
          </Text>
        )}
      </YStack>
    );
  }
);
