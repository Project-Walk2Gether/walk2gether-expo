import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";

export default function HowItWorksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const handleGotIt = () => {
    router.replace("/(app)");
  };

  return (
    <LinearGradient
      colors={["#4EB1BA", "#6EDAA8", "#8BEBA0"]}
      style={styles.gradientContainer}
    >
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screenContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Walk2gether!</Text>
          <Text style={styles.subtitle}>Here's how it works</Text>

          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.stepContainer}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Join a Walk</Text>
                  <Text style={styles.stepDescription}>
                    Sign up for a scheduled walk in your area
                  </Text>
                </View>
              </View>

              <View style={styles.stepContainer}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Check In</Text>
                  <Text style={styles.stepDescription}>
                    When you arrive, check in to confirm your participation and
                    get matched with your first walking buddy
                  </Text>
                </View>
              </View>

              <View style={styles.stepContainer}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Walk & Talk</Text>
                  <Text style={styles.stepDescription}>
                    Enjoy a walk with your partner! After a while, we'll rotate
                    pairs, so you can get to know others on the walk
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.gotItButton} onPress={handleGotIt}>
            <Text style={styles.gotItButtonText}>Got It!</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  walkingScene: {
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "white",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  screenContainer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
    marginBottom: 30,
  },
  card: {
    paddingTop: 30,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  stepNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4EB1BA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumber: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: "#666",
  },
  gotItButton: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 10,
  },
  gotItButtonText: {
    color: "#4EB1BA",
    fontWeight: "bold",
    fontSize: 18,
  },
});
