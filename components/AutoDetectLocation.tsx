import { CheckCircle, X as XIcon } from "@tamagui/lucide-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";
import FakeLoadingBar from "./FakeLoadingBar";

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
  clearLocation,
  expectedWaitTime = 5000,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const locationFound = useRef(false);
  useEffect(() => {
    let cancelled = false;
    async function detectLocation() {
      setLoading(true);
      setProgress(0);
      setError(null);
      locationFound.current = false;

      try {
        // Artificial delay in development mode
        if (__DEV__) {
          await new Promise((resolve) =>
            setTimeout(() => {
              if (!cancelled) {
                setProgress(20); // Update progress after permission
                resolve(null);
              }
            }, 1000)
          );
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }

        if (__DEV__) {
          await new Promise((resolve) =>
            setTimeout(() => {
              if (!cancelled) {
                setProgress(50); // Update progress after getting position
                resolve(null);
              }
            }, 1500)
          );
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = position.coords;

        if (__DEV__) {
          await new Promise((resolve) =>
            setTimeout(() => {
              if (!cancelled) {
                setProgress(70); // Update progress before API call
                resolve(null);
              }
            }, 1000)
          );
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCVRcp8LoR83nVd-ur3kEQ6MdOYMBevHhk`
        );
        const data = await response.json();

        if (__DEV__) {
          await new Promise((resolve) =>
            setTimeout(() => {
              if (!cancelled) {
                setProgress(90); // Update progress after API call
                resolve(null);
              }
            }, 1000)
          );
        }

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

    if (error) return <Text color="$red10">{error}</Text>;

    if (values.location)
      return (
        <>
          <CheckCircle size={18} color="#22c55e" style={{ marginRight: 6 }} />
          <Text color="$green10" fontWeight="bold" fontSize={16} flex={1}>
            {values.location.name}
          </Text>
        </>
      );
  }

  return (
    <XStack
      ai="center"
      jc="center"
      bg="$green1"
      px={12}
      py={8}
      br={10}
      my={4}
      width="100%"
      gap="$2"
    >
      {getContent()}
      <Button
        size="$2"
        circular
        chromeless
        ml={8}
        onPress={clearLocation}
        aria-label="Clear location"
      >
        <XIcon size={16} color="#888" />
      </Button>
    </XStack>
  );
};

export default AutoDetectLocation;
