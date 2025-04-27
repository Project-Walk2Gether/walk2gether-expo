import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { Spinner, Text, YStack } from "tamagui";
import { WalkWizard } from "../../../components/WalkWizard";
import { WalkFormProvider } from "../../../context/WalkFormContext";

export default function NewWalkWizardScreen() {
  const [locationReady, setLocationReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateFormData } = require("../../../context/WalkFormContext");

  useEffect(() => {
    let isMounted = true;
    async function fetchLocation() {
      try {
        setError(null);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied.");
          setLocationReady(true);
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = position.coords;
        // Optionally, reverse geocode here or just set lat/lng
        updateFormData({
          location: {
            name: "Current Location",
            description: "Your current location",
            latitude,
            longitude,
          },
        });
      } catch (e: any) {
        setError("Unable to get your location.");
      } finally {
        if (isMounted) setLocationReady(true);
      }
    }
    fetchLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <WalkFormProvider>
      {locationReady ? (
        <WalkWizard />
      ) : (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
        >
          <Spinner size="large" color="$blue10" />
          <Text marginTop="$4" fontSize={18} color="$blue10">
            Getting your location...
          </Text>
          {error && (
            <Text marginTop="$2" color="$red10">
              {error}
            </Text>
          )}
        </YStack>
      )}
    </WalkFormProvider>
  );
}
