import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";
import { Text, View } from "tamagui";
import { Location } from "walk2gether-shared";

interface LocationFieldProps {
  value: Location | null;
  onChange: (location: Location) => void;
  error?: string;
  touched?: boolean;
  googleApiKey: string;
}

export default function LocationField({
  value,
  onChange,
  error,
  touched,
  googleApiKey,
}: LocationFieldProps) {
  console.log({ value });

  const mapRef = useRef();
  const region = value
    ? {
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : undefined;

  useEffect(() => {
    if (!region) return;
    mapRef.current?.animateToRegion(region, 1000);
  }, [value]);

  return (
    <>
      <View>
        <Text style={styles.sectionTitle}>Location</Text>
        <GooglePlacesAutocomplete
          placeholder="Search for a location"
          fetchDetails={true}
          keepResultsAfterBlur
          onPress={(data, details = null) => {
            if (details) {
              onChange({
                name: data.description,
                placeId: data.place_id,
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
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
                    geometry: {
                      location: {
                        lat: value.latitude,
                        lng: value.longitude,
                      },
                    },
                  },
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
            },
            predefinedPlacesDescription: {
              color: "#1faadb",
            },
            listView: {
              backgroundColor: "white",
              borderRadius: 8,
              marginTop: 5,
            },
          }}
        />
        {error && touched && <Text style={styles.errorText}>{error}</Text>}
      </View>
      {value?.latitude ? (
        <MapView
          style={{ width: "100%", height: 200 }}
          // onLongPress={handleLongPress}
          ref={mapRef}
          initialRegion={region}
        >
          <Marker
            coordinate={value}
            title={"My Marker"}
            description={"Long-pressed location"}
          />
        </MapView>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
