import { CheckCircle, X as XIcon } from "@tamagui/lucide-icons";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Button, Text, XStack } from "tamagui";

interface AutoDetectLocationProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  setLocationMode: (mode: "none" | "auto" | "manual") => void;
  clearLocation?: () => void;
}

const AutoDetectLocation: React.FC<AutoDetectLocationProps> = ({
  values,
  setFieldValue,
  clearLocation,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function detectLocation() {
      setLoading(true);
      setError(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCVRcp8LoR83nVd-ur3kEQ6MdOYMBevHhk`
        );
        const data = await response.json();
        const cityResult = data.results.find(
          (r: any) =>
            r.types.includes("locality") || r.types.includes("postal_town")
        );
        if (cityResult) {
          setFieldValue("location", {
            name: cityResult.formatted_address,
            placeId: cityResult.place_id,
            latitude,
            longitude,
          });
        } else {
          setError("Could not determine city from your location.");
        }
      } catch (err: any) {
        setError("Error: " + err.message);
      } finally {
        setLoading(false);
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
    if (loading) return <Text>Detecting your location...</Text>;
    if (error) return <Text color="$red10">{error}</Text>;

    if (values.location)
      return (
        <>
          <CheckCircle size={18} color="#22c55e" style={{ marginRight: 6 }} />
          <Text
            color="$green10"
            fontWeight="bold"
            fontSize={16}
            flex={1}
            numberOfLines={1}
          >
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
