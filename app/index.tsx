import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      console.log(
        "Auth state loaded, user:",
        user ? "authenticated" : "unauthenticated"
      );
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/auth");
      }
    }
  }, [user, loading, router]);

  // Show loading indicator while checking auth state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4285F4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
