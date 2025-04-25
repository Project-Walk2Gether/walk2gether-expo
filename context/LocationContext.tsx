import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

interface LocationContextValue {
  coords?: { latitude: number; longitude: number };
  error?: string;
  loading: boolean;
  refresh: () => void;
}

const LocationContext = createContext<LocationContextValue>({
  loading: true,
  refresh: () => {},
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  const getLocation = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission not granted");
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e: any) {
      setError(e.message || "Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ coords, error, loading, refresh: getLocation }}>
      {children}
    </LocationContext.Provider>
  );
};
