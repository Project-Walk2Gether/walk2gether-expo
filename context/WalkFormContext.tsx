import * as Location from "expo-location";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface WalkFormData {
  walkType: "friends" | "meetup" | "neighborhood" | null;
  date: Date | null;
  time: Date | null;
  location: {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
  } | null;
  duration: number | null;
  invitees: string[] | null; // Keeping for backward compatibility
  invitedUserIds: string[] | null; // Specific friends to invite
  invitedPhoneNumbers: string[] | null; // Phone numbers to send SMS invites
  isNeighborhoodWalk: boolean;
}

interface WalkFormContextType {
  formData: WalkFormData;
  updateFormData: (newData: Partial<WalkFormData>) => void;
  resetForm: () => void;
  currentStep: number;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: number) => void;
  totalSteps: number;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  isLocationLoading: boolean;
  locationError: string | null;
}

const initialFormData: WalkFormData = {
  walkType: null,
  date: null,
  time: null,
  location: null,
  duration: 30, // Default duration in minutes
  invitees: null,
  invitedUserIds: null,
  invitedPhoneNumbers: null,
  isNeighborhoodWalk: false,
};

const WalkFormContext = createContext<WalkFormContextType | undefined>(
  undefined
);

export interface WalkFormProviderProps {
  children: React.ReactNode;
  isLocationReady?: boolean;
}

export const WalkFormProvider: React.FC<WalkFormProviderProps> = ({
  children,
  isLocationReady = true,
}) => {
  const [formData, setFormData] = useState<WalkFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6; // Type selection + 4 wizard steps
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const updateFormData = (newData: Partial<WalkFormData>) => {
    setFormData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  // Function to request and get the user's current location
  const fetchUserLocation = async () => {
    setIsLocationLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        setIsLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      setLocationError("Could not get your location");
      console.error("Error getting location:", error);
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Fetch location when component mounts
  useEffect(() => {
    fetchUserLocation();
  }, []);

  return (
    <WalkFormContext.Provider
      value={{
        formData,
        updateFormData,
        resetForm,
        currentStep,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        totalSteps,
        userLocation,
        isLocationLoading,
        locationError,
      }}
    >
      {children}
    </WalkFormContext.Provider>
  );
};

export const useWalkForm = (): WalkFormContextType => {
  const context = useContext(WalkFormContext);
  if (!context) {
    throw new Error("useWalkForm must be used within a WalkFormProvider");
  }
  return context;
};

// Higher-Order Component (HOC) that wraps a component with the WalkFormProvider
export const WithWalkFormProvider = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & Partial<WalkFormProviderProps>> => {
  return (props) => {
    const { isLocationReady, ...componentProps } = props;

    return (
      <WalkFormProvider isLocationReady={isLocationReady}>
        <Component {...(componentProps as P)} />
      </WalkFormProvider>
    );
  };
};
