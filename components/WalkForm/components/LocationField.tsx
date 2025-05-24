import {
  PlaceData,
  PlacesAutocomplete,
} from "@/components/UI/PlacesAutocomplete";
import React, { useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import { H4, YStack } from "tamagui";
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
  const mapRef = useRef<MapView>(null);
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

  const handleLocationSelect = (placeData: PlaceData) => {
    onChange({
      name: placeData.name,
      placeId: placeData.placeId,
      latitude: placeData.latitude,
      longitude: placeData.longitude,
    });
  };

  // Convert Location to PlaceData for our component
  const placeDataValue = value
    ? {
        name: value.name || "",
        placeId: value.placeId || "",
        latitude: value.latitude,
        longitude: value.longitude,
        description: value.name || "",
      }
    : null;

  return (
    <>
      <YStack marginBottom="$5">
        <H4 fontSize="$4" fontWeight="bold" marginBottom="$2">
          Location
        </H4>
        <PlacesAutocomplete
          placeholder="Search for a location"
          value={placeDataValue}
          onSelect={handleLocationSelect}
          googleApiKey={googleApiKey}
          error={error}
          touched={touched}
          textInputStyles={{
            marginLeft: 0,
            marginRight: 0,
            height: 45,
            color: "#5d5d5d",
            fontSize: 16,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
          }}
        />
      </YStack>
      {value?.latitude ? (
        <MapView
          style={{ width: "100%", height: 200 }}
          ref={mapRef}
          initialRegion={region}
        >
          <Marker
            coordinate={value}
            title={value.name}
            description={"Selected location"}
          />
        </MapView>
      ) : null}
    </>
  );
}
