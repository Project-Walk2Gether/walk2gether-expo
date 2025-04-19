import React, { useRef } from "react";
import { Keyboard } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { Button, Text, YStack } from "tamagui";

interface LocationAutocompleteProps {
  value: any;
  setFieldValue: (field: string, value: any) => void;
  showLocationResults: boolean;
  setShowLocationResults: (show: boolean) => void;
  touched: any;
  errors: any;
  styles: any;
  placeholder?: string;
  includeChooseAnotherWayButton?: boolean;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  setFieldValue,
  showLocationResults,
  setShowLocationResults,
  touched,
  errors,
  styles,
  placeholder = "Search for your city",
  includeChooseAnotherWayButton,
}) => {
  const placesAutocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  return (
    <YStack space="$2">
      <GooglePlacesAutocomplete
        ref={placesAutocompleteRef}
        placeholder={placeholder}
        enablePoweredByContainer={false}
        suppressDefaultStyles={false}
        listViewDisplayed={showLocationResults}
        onPress={(data, details) => {
          if (details) {
            const locationData = {
              name: data.description,
              placeId: data.place_id || data.id,
              latitude: details.geometry?.location?.lat || 0,
              longitude: details.geometry?.location?.lng || 0,
            };
            setFieldValue("location", locationData);
          } else {
            setFieldValue("location", null);
          }
          setShowLocationResults(false);
          setTimeout(() => {
            placesAutocompleteRef.current?.setAddressText(data.description);
            Keyboard.dismiss();
          }, 100);
        }}
        textInputProps={{
          onFocus: () => {
            setShowLocationResults(true);
            setTimeout(() => {
              placesAutocompleteRef.current?.scrollToEnd?.({
                animated: true,
              });
            }, 100);
          },
          autoComplete: "off",
          onBlur: () => {
            setTimeout(() => {
              if (value) {
                setShowLocationResults(false);
              }
            }, 200);
          },
        }}
        query={{
          key: "AIzaSyCVRcp8LoR83nVd-ur3kEQ6MdOYMBevHhk",
          language: "en",
        }}
        styles={styles}
      />
      {touched.location && errors.location && (
        <Text color="$red10" fontSize="$2">
          {errors.location}
        </Text>
      )}
      {value && includeChooseAnotherWayButton && (
        <Button
          size="$2"
          variant="outlined"
          mt="$2"
          onPress={() => {
            setFieldValue("location", null);
            setShowLocationResults(false);
          }}
        >
          Choose another way
        </Button>
      )}
      {!value && (
        <Button
          size="$2"
          variant="outlined"
          mt="$2"
          onPress={() => setShowLocationResults(false)}
        >
          Choose another way
        </Button>
      )}
    </YStack>
  );
};

export default LocationAutocomplete;
