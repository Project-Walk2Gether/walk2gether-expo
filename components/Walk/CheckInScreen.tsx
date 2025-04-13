import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { collection, doc, setDoc } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, View, YStack } from "tamagui";
import { Walk } from "walk2gether-shared";

interface CheckInScreenProps {
  walk: Walk;
  onCheckInSuccess: () => void;
}

export default function CheckInScreen({ walk, onCheckInSuccess }: CheckInScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCheckIn = async () => {
    if (!user || !walk?.id) return;
    
    setLoading(true);
    try {
      // Create a participant document for the user
      const participantRef = doc(
        firestore_instance,
        `walks/${walk.id}/participants/${user.uid}`
      );
      
      await setDoc(participantRef, {
        userUid: user.uid,
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Trigger the success callback
      onCheckInSuccess();
    } catch (error) {
      console.error("Error checking in:", error);
      // Show an error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <YStack space="$4" style={styles.content}>
        <Text fontSize="$8" fontWeight="bold" textAlign="center">
          Check In to Walk
        </Text>
        
        <Text fontSize="$4" textAlign="center" color="$gray11">
          You need to check in to participate in this walk.
        </Text>
        
        <View style={styles.walkDetails}>
          <Text fontSize="$5" fontWeight="600">
            Walk with {walk.organizerName}
          </Text>
          <Text fontSize="$3" color="$gray11">
            Organized by {walk.organizerName}
          </Text>
          <Text fontSize="$3" color="$gray11">
            {new Date(walk.date.toDate()).toLocaleString()} • {walk.durationMinutes} minutes
          </Text>
          <Text fontSize="$3" color="$gray11" marginTop="$2">
            {walk.location.name}
          </Text>
        </View>
        
        <Button
          size="$5"
          theme="green"
          onPress={handleCheckIn}
          disabled={loading}
          style={styles.checkInButton}
        >
          {loading ? <ActivityIndicator color="white" /> : "Check In Now"}
        </Button>
        
        <Button 
          size="$4"
          chromeless
          onPress={() => router.back()}
        >
          Go Back
        </Button>
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  walkDetails: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginVertical: 20,
  },
  checkInButton: {
    marginTop: 12,
  },
});
