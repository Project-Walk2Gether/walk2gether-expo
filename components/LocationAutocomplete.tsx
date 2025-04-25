import React, { useRef } from "react";
import { Keyboard } from "react-native";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import { Button, Text, YStack } from "tamagui";
import { COLORS } from "../styles/colors";

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

const LocationAutocomplete: React.FC<Omit<LocationAutocompleteProps, 'styles'>> = ({
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

  // Custom styles for GooglePlacesAutocomplete to match Input in UserDataForm
  const inputStyles = {
    textInput: {
      width: '100%',
      borderColor: COLORS.primary,
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 18,
      height: 100,
      borderWidth: 1,
    },
    textInputContainer: {
      width: '100%',
      borderRadius: 10,
      borderColor: COLORS.primary,
      borderWidth: 1,
      backgroundColor: COLORS.background,
    },
    listView: {
      borderRadius: 10,
      marginTop: 4,
    },
  };

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
        styles={inputStyles}
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
            onCancel();
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
