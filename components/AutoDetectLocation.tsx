import React, { useEffect, useState } from 'react';
import { Text, YStack } from 'tamagui';
import * as Location from 'expo-location';

interface AutoDetectLocationProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  setLocationMode: (mode: 'none' | 'auto' | 'manual') => void;
}

const AutoDetectLocation: React.FC<AutoDetectLocationProps> = ({ values, setFieldValue }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function detectLocation() {
      setLoading(true);
      setError(null);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCVRcp8LoR83nVd-ur3kEQ6MdOYMBevHhk`
        );
        const data = await response.json();
        const cityResult = data.results.find((r: any) =>
          r.types.includes('locality') || r.types.includes('postal_town')
        );
        if (cityResult) {
          setFieldValue('location', {
            name: cityResult.formatted_address,
            placeId: cityResult.place_id,
            latitude,
            longitude,
          });
        } else {
          setError('Could not determine city from your location.');
        }
      } catch (err: any) {
        setError('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    if (!values.location) {
      detectLocation();
    }
    return () => { cancelled = true; };
  }, [values.location]);

  if (loading) return <Text>Detecting your location...</Text>;
  if (error) return <Text color="$red10">{error}</Text>;
  if (values.location) return (
    <YStack ai="center">
      <Text color="$green10">Detected: {values.location.name}</Text>
    </YStack>
  );
  return null;
};

export default AutoDetectLocation;
