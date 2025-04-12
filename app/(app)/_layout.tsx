import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import HeaderBackButton from "../../components/HeaderBackButton";
import { useAuth } from "../../context/AuthContext";
import { UserDataProvider } from "../../context/UserDataContext";
import { WalksProvider } from "../../context/WalksContext.bak";

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    console.log("Redirecting to signin");
    return <Redirect href="/auth" />;
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
    <UserDataProvider>
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
              title: "Schedule a new walk",
              headerShown: true,
              presentation: "modal",
              headerLeft: () => <HeaderBackButton />,
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
    </UserDataProvider>
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
