import { useUserData } from "context/UserDataContext";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import HeaderBackButton from "../../components/HeaderBackButton";
import { useAuth } from "../../context/AuthContext";
import { WalksProvider } from "../../context/WalksContext";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  if (!loading && !user) {
    return <Redirect href="/auth" />;
  }

  console.log({ userDataLoading, userData });

  if (!userDataLoading && !userData) {
    console.log("Redirecting");
    return <Redirect href="/onboarding/complete-your-profile" />;
  }

  // Show loading indicator while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"#8AB0A0"} />
      </View>
    );
  }

  return (
    <WalksProvider>
      <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="(modals)/profile"
          options={{
            title: "Profile",
            headerShown: true,
            presentation: "modal",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="(modals)/walk/[id]"
          options={{
            title: "Let's walk 2gether!",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="(modals)/new-walk"
          options={{
            title: "Schedule a new walk",
            headerShown: true,
            presentation: "modal",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="(modals)/edit-walk/[id]"
          options={{
            title: "Edit walk",
            headerShown: true,
            presentation: "modal",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
        <Stack.Screen
          name="(modals)/invite-to-walk"
          options={{
            title: "Schedule a new walk",
            headerShown: true,
            presentation: "modal",
            headerLeft: () => <HeaderBackButton />,
          }}
        />
      </Stack>
    </WalksProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
