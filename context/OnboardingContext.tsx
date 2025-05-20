import { useDoc } from "@/utils/firestore";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useLocation } from "./LocationContext";

// Define the onboarding flow screens in order
const ONBOARDING_SCREENS = [
  "/onboarding/complete-your-profile",
  "/onboarding/how-it-works",
  "/onboarding/notification-permissions",
  "/onboarding/location-permissions",
];

// Types for the referral information
type ReferralInfo = {
  referredByUid?: string;
};

// Create the context with navigation functions
interface OnboardingContextType {
  goToNextScreen: () => void;
  goToPreviousScreen: () => void;
  getCurrentScreenIndex: () => number;
  startOnboarding: (options?: { referralInfo?: ReferralInfo }) => void;
  referralInfo: ReferralInfo | null;
  determineNextScreen: () => string | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

// Context provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { locationPermission } = useLocation();
  
  // Get user data using the custom useDoc hook as per project standards
  const { doc: userData, status: userDataStatus } = useDoc(
    user ? `users/${user.uid}` : undefined
  );
  
  const userDataLoading = userDataStatus === "loading";

  // Get the current screen index based on the pathname
  const getCurrentScreenIndex = (): number => {
    // Normalize the pathname to match the format in ONBOARDING_SCREENS
    const normalizedPath = pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
    const index = ONBOARDING_SCREENS.findIndex((screen) => {
      const screenPath = screen.endsWith("/") ? screen.slice(0, -1) : screen;
      return normalizedPath === screenPath;
    });
    return index !== -1 ? index : 0; // Default to 0 if not found
  };

  // Start the onboarding flow with optional parameters
  const startOnboarding = (options?: { referralInfo?: ReferralInfo }) => {
    if (options?.referralInfo) {
      setReferralInfo(options.referralInfo);
    }
    const nextScreen = determineNextScreen();
    if (nextScreen) {
      router.push(nextScreen as any);
    }
  };

  // Determine which screen should be shown next based on user data and permissions
  const determineNextScreen = (): string | null => {
    if (userDataLoading) return null;

    // Check if user data exists - if not, need to complete profile
    if (!userData) {
      return "/onboarding/complete-your-profile";
    }

    // Check if notifications permissions need to be set
    if (!userData.notificationsPermissionsSetAt) {
      return "/onboarding/notification-permissions";
    }

    // Check if location permissions need to be set
    if (!userData.locationPermissionsSetAt) {
      return "/onboarding/location-permissions";
    }

    // All steps complete, return to main app
    return "/(app)/(tabs)";
  };

  const goToNextScreen = () => {
    const currentIndex = getCurrentScreenIndex();
    console.log("Current index:", currentIndex);
    console.log("Onboarding screens:", ONBOARDING_SCREENS);
    
    // First check if we should redirect to a specific screen based on conditions
    const nextRequiredScreen = determineNextScreen();
    if (nextRequiredScreen) {
      // If current screen is already the next required screen, move to the next one in the flow
      if (pathname.includes(nextRequiredScreen)) {
        if (currentIndex < ONBOARDING_SCREENS.length - 1) {
          const nextScreen = ONBOARDING_SCREENS[currentIndex + 1];
          router.push(nextScreen as any);
        } else {
          // If we're at the last screen, complete onboarding and go to main app
          router.replace("/(app)/(tabs)" as any);
        }
      } else {
        // Otherwise, go to the next required screen
        router.push(nextRequiredScreen as any);
      }
    } else if (currentIndex < ONBOARDING_SCREENS.length - 1) {
      // Standard progression if no specific screen is required
      const nextScreen = ONBOARDING_SCREENS[currentIndex + 1];
      router.push(nextScreen as any);
    } else {
      // If we're at the last screen, complete onboarding and go to main app
      router.replace("/(app)/(tabs)" as any);
    }
  };

  const goToPreviousScreen = () => {
    const currentIndex = getCurrentScreenIndex();
    if (currentIndex > 0) {
      const prevScreen = ONBOARDING_SCREENS[currentIndex - 1];
      router.push(prevScreen as any);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        goToNextScreen,
        goToPreviousScreen,
        getCurrentScreenIndex,
        startOnboarding,
        referralInfo,
        determineNextScreen,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
