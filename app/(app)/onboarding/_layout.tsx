import { Stack, useRouter } from "expo-router";
import React, { createContext, useContext, useState, useEffect } from "react";
import { COLORS } from "../../../styles/colors";

// Define the onboarding flow screens in order
const ONBOARDING_SCREENS = [
  "/onboarding/how-it-works",
  "/onboarding/complete-your-profile",
  "/onboarding/notification-permissions",
  // Add more screens as needed
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
  skipOnboarding: () => void;
  currentScreenIndex: number;
  startOnboarding: (options?: { skipIntro?: boolean, referralInfo?: ReferralInfo }) => void;
  referralInfo: ReferralInfo | null;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Context provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const router = useRouter();
  
  // Since we can't directly access the current path from the router,
  // we'll use the screen transitions to track the index
  
  // Start the onboarding flow with optional parameters
  const startOnboarding = (options?: { skipIntro?: boolean, referralInfo?: ReferralInfo }) => {
    if (options?.referralInfo) {
      setReferralInfo(options.referralInfo);
    }
    
    // Determine if we should skip the intro screen
    if (options?.skipIntro) {
      setCurrentScreenIndex(1); // Skip to complete-your-profile
      router.replace({
        pathname: "/onboarding/complete-your-profile" as any,
      });
    } else {
      setCurrentScreenIndex(0);
      router.replace("/onboarding/how-it-works" as any);
    }
  };
  
  const goToNextScreen = () => {
    if (currentScreenIndex < ONBOARDING_SCREENS.length - 1) {
      const nextScreen = ONBOARDING_SCREENS[currentScreenIndex + 1];
      setCurrentScreenIndex(currentScreenIndex + 1);
      router.push(nextScreen as any);
    } else {
      // If we're at the last screen, complete onboarding and go to main app
      router.replace("/(app)/(tabs)" as any);
    }
  };
  
  const goToPreviousScreen = () => {
    if (currentScreenIndex > 0) {
      const prevScreen = ONBOARDING_SCREENS[currentScreenIndex - 1];
      setCurrentScreenIndex(currentScreenIndex - 1);
      router.push(prevScreen as any);
    }
  };
  
  const skipOnboarding = () => {
    // Skip to the last required screen or complete onboarding
    router.replace("/onboarding/complete-your-profile" as any);
  };
  
  return (
    <OnboardingContext.Provider 
      value={{ 
        goToNextScreen, 
        goToPreviousScreen, 
        skipOnboarding, 
        currentScreenIndex,
        startOnboarding,
        referralInfo
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
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: COLORS.background }
        }}
      />
    </OnboardingProvider>
  );
}
