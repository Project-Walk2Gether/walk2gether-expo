import CustomTabBar from "@/components/CustomTabBar";
import Tour from "@/components/Tour";
import { useUserData } from "@/context/UserDataContext";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";

export default function TabLayout() {
  const { userData, loading: userDataLoading } = useUserData();
  const [showTour, setShowTour] = useState(false);

  // Check if we should show the tour when user data is loaded
  useEffect(() => {
    if (!userDataLoading && userData) {
      // Show tour if user hasn't dismissed it yet
      setTimeout(() => {
        console.log("SHOWING TOUR: ", !userData.tourDismissedAt);
        setShowTour(!userData.tourDismissedAt);
      }, 400);
    }
  }, [userDataLoading, userData]);

  // Handle tour dismissal
  const handleDismissTour = () => {
    setShowTour(false);
  };

  if (!userDataLoading && !userData) {
    return <Redirect href="/onboarding/complete-your-profile" />;
  }
  return (
    <>
      {/* Feature Tour */}
      <Tour isVisible={showTour} onDismiss={handleDismissTour} />

      <Tabs
        initialRouteName="walks"
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen name="walks" />
        <Tabs.Screen name="friends" />
        <Tabs.Screen name="me" />
      </Tabs>
    </>
  );
}
