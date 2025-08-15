import CustomTabBar from "@/components/CustomTabBar";
import { useUserData } from "@/context/UserDataContext";
import { Redirect, Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { userData, loading: userDataLoading } = useUserData();

  if (!userDataLoading && !userData) {
    return <Redirect href="/onboarding/complete-your-profile" />;
  }
  return (
    <Tabs
      initialRouteName="walks"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="walks" />
      <Tabs.Screen name="availability" />
      <Tabs.Screen name="friends" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
