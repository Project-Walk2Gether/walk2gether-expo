import Tour from "@/components/Tour";
import WalkIcon from "@/components/WalkIcon";
import { useUpdates } from "@/context/UpdatesContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { Bell, Footprints, User } from "@tamagui/lucide-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "tamagui";
import useDynamicRefs from "use-dynamic-refs";

export default function TabLayout() {
  const { userData, loading: userDataLoading } = useUserData();
  const { isUpdateAvailable } = useUpdates();
  const [getRef, setRef] = useDynamicRefs();
  const [showTour, setShowTour] = useState(false);

  // Check if we should show the tour when user data is loaded
  useEffect(() => {
    if (!userDataLoading && userData) {
      // Show tour if user hasn't dismissed it yet
      console.log("SHOWING TOUR: ", !userData.tourDismissedAt);
      setTimeout(() => {
        setShowTour(!userData.tourDismissedAt);
      }, 1000);
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
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.inactive,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopColor: "#E0E0E0",
            paddingTop: 6,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          },
        }}
      >
        <Tabs.Screen
          name="walks"
          options={{
            title: "Walks",
            tabBarIcon: ({ color, size }) => (
              <Footprints size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: "Friends",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <View ref={setRef("friendsTab") as any}>
                <WalkIcon size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="me"
          options={{
            title: "Me",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <View position="relative">
                <User size={size} color={color} />
                {isUpdateAvailable && (
                  <View
                    position="absolute"
                    top={-5}
                    right={-10}
                    width={18}
                    height={18}
                    borderRadius={9}
                    backgroundColor={COLORS.accent1}
                    justifyContent="center"
                    alignItems="center"
                    borderWidth={1}
                    borderColor="white"
                  >
                    <Bell size={12} color="white" />
                  </View>
                )}
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}
