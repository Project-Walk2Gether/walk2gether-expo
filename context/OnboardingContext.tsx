import { usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useState } from "react";

// Define simple onboarding screens in sequence
const ONBOARDING_SCREENS = [
  "/onboarding/complete-your-profile",
  "/onboarding/how-it-works", 
  "/onboarding/notification-permissions",
  "/onboarding/location-permissions"
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
    // Simply navigate to the first screen in our flow
    router.push(ONBOARDING_SCREENS[0] as any);
  };

  // Go to the next screen in sequence or complete onboarding
  const goToNextScreen = () => {
    const currentIndex = getCurrentScreenIndex();
    // If we're at the last screen, complete onboarding
    if (currentIndex >= ONBOARDING_SCREENS.length - 1) {
      // All done, go to main app
      router.replace("/(app)/(tabs)" as any);
      return;
    }
    
    // Otherwise, go to the next screen in the sequence
    const nextScreen = ONBOARDING_SCREENS[currentIndex + 1];
    router.push(nextScreen as any);
  };

  // Go to the previous screen if possible
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
