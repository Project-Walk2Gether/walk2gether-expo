import { useLocation } from "@/context/LocationContext";
import { MapPin, X as XIcon } from "@tamagui/lucide-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import FakeLoadingBar from "./FakeLoadingBar";
import { FormInput } from "./FormInput";

interface AutoDetectLocationProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  setLocationMode: (mode: "none" | "auto" | "manual") => void;
  clearLocation?: () => void;
  expectedWaitTime?: number; // in milliseconds
}

const AutoDetectLocation: React.FC<AutoDetectLocationProps> = ({
  values,
  setFieldValue,
  setLocationMode,
  clearLocation,
  expectedWaitTime = 9000,
}) => {
  const { locationPermission, requestForegroundPermissions } = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const locationFound = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function detectLocation() {
      // Only proceed if location permission is granted
      if (!locationPermission) {
        // Request only foreground permissions instead of showing error
        try {
          const permissionGranted = await requestForegroundPermissions();
          if (!permissionGranted) {
            // User denied permission, clear location
            if (clearLocation) clearLocation();
            return;
          }
        } catch (error) {
          // Handle any errors during permission request
          if (clearLocation) clearLocation();
          return;
        }
      }

      setLoading(true);
      setError(null);
      locationFound.current = false;

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = position.coords;

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCVRcp8LoR83nVd-ur3kEQ6MdOYMBevHhk`
        );
        const data = await response.json();

        // Look for street address level result first
        const streetAddressResult = data.results.find((r: any) =>
          r.types.includes("street_address")
        );

        // If no street address, try route
        const routeResult =
          !streetAddressResult &&
          data.results.find((r: any) => r.types.includes("route"));

        // If neither street address nor route, fall back to neighborhood
        const neighborhoodResult =
          !streetAddressResult &&
          !routeResult &&
          data.results.find((r: any) => r.types.includes("neighborhood"));

        // If none of the above, try city level
        const cityResult =
          !streetAddressResult &&
          !routeResult &&
          !neighborhoodResult &&
          data.results.find(
            (r: any) =>
              r.types.includes("locality") || r.types.includes("postal_town")
          );

        const result =
          streetAddressResult ||
          routeResult ||
          neighborhoodResult ||
          cityResult;

        if (result) {
          locationFound.current = true;
          setProgress(100); // Complete the progress

          setFieldValue("location", {
            name: result.formatted_address,
            placeId: result.place_id,
            latitude,
            longitude,
          });
        } else {
          setError("Could not determine address from your location.");
        }
      } catch (err: any) {
        setError("Error: " + err.message);
      } finally {
        // Only set loading to false if we didn't find a location
        // If we found a location, we'll let the progress animation complete first
        if (!locationFound.current) {
          setLoading(false);
        }
      }
    }
    // Always try to detect location if we don't have one yet
    if (!values.location) {
      detectLocation();
    }
    return () => {
      cancelled = true;
    };
  }, [values.location]);

  function getContent() {
    if (loading) {
      return (
        <YStack width="100%" p={8}>
          <FakeLoadingBar
            expectedWaitTime={expectedWaitTime}
            progress={progress}
            showText
            progressText="Detecting location"
            onComplete={() => {
              if (locationFound.current) {
                setTimeout(() => setLoading(false), 300);
              }
            }}
          />
        </YStack>
      );
    }

    if (error) {
      // Show error with manual entry option
      return (
        <YStack width="100%" alignItems="center" justifyContent="space-between">
          <Text flexShrink={1} color="$red10">
            {error}
          </Text>
          <Button
            size="$3"
            backgroundColor="$blue9"
            onPress={() => setLocationMode("manual")}
            icon={<MapPin size={16} color="white" />}
          >
            Enter manually
          </Button>
        </YStack>
      );
    }

    if (values.location)
      return (
        <FormInput
          value={values.location.name}
          onChangeText={(text) => {
            setFieldValue("location", {
              ...values.location,
              name: text,
            });
          }}
          placeholder="Enter location"
          // leftAccessory={<CheckCircle size={18} color="#22c55e" />}
          rightAccessory={
            <Button
              size="$2"
              circular
              chromeless
              onPress={clearLocation}
              aria-label="Clear location"
            >
              <XIcon size={16} color="#888" />
            </Button>
          }
        />
      );
  }

  return (
    <XStack ai="center" jc="center" width="100%">
      {getContent()}
    </XStack>
  );
};

export default AutoDetectLocation;
