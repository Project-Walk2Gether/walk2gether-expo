import { COLORS } from "@/styles/colors";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { createContext, useContext, useState } from "react";

// Define the onboarding flow screens in order
const ONBOARDING_SCREENS = [
  "/onboarding/complete-your-profile",
  "/onboarding/how-it-works",
  "/onboarding/notification-permissions",
];

// Types for the referral information
type ReferralInfo = {
  referredByUid?: string;
  acceptFriendship?: boolean;
};

// Create the context with navigation functions
type OnboardingContextType = {
  goToNextScreen: () => void;
  goToPreviousScreen: () => void;
  getCurrentScreenIndex: () => number;
  startOnboarding: (options?: { referralInfo?: ReferralInfo }) => void;
  referralInfo: ReferralInfo | null;
};

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
  };

  const goToNextScreen = () => {
    const currentIndex = getCurrentScreenIndex();
    if (currentIndex < ONBOARDING_SCREENS.length - 1) {
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

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        initialRouteName="complete-your-profile"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: COLORS.background },
        }}
      />
    </OnboardingProvider>
  );
}
