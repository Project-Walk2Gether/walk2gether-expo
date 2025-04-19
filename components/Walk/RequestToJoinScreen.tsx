import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, View, YStack } from "tamagui";
import { Participant, Walk } from "walk2gether-shared";
import { firestore_instance } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { useDoc } from "../../utils/firestore";

interface CheckInScreenProps {
  walk: Walk;
}

export default function RequestToJoinScreen({ walk }: CheckInScreenProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { doc: participantDoc } = useDoc<Participant>(
    `walks/${walk.id}/participants/${user?.uid}`
  );
  const requestSent = !!participantDoc;

  const handleRequestToJoin = async () => {
    if (!user || !walk?.id) return;

    setLoading(true);
    try {
      // Create a request document for the user
      const participantId = user.uid; // Use the user's ID as the request ID
      const participantRef = doc(
        firestore_instance,
        `walks/${walk.id}/participants/${participantId}`
      );

      const participant: Participant = {
        userUid: user.uid,
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || null,
        approvedAt: null,
        lastLocation: {
          latitude: 0,
          longitude: 0,
          timestamp: Timestamp.now(),
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        userUids: [user.uid],
      };

      await setDoc(participantRef, participant, { merge: true });
    } catch (error) {
      console.error("Error requesting to join:", error);
      // Show an error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <YStack space="$4" style={styles.content}>
        {requestSent ? (
          <>
            <Text fontSize="$8" fontWeight="bold" textAlign="center">
              Request Sent!
            </Text>

            <Text fontSize="$4" textAlign="center" color="$gray11">
              The walk organizer needs to approve your request to join.
            </Text>

            <View style={styles.walkDetails}>
              <Text fontSize="$5" fontWeight="600">
                Walk with {walk.organizerName}
              </Text>
              <Text fontSize="$3" color="$gray11">
                Organized by {walk.organizerName}
              </Text>
              <Text fontSize="$3" color="$gray11">
                {new Date(walk.date.toDate()).toLocaleString()} •{" "}
                {walk.durationMinutes} minutes
              </Text>
              <Text fontSize="$3" color="$gray11" marginTop="$2">
                {walk.location.name}
              </Text>
            </View>

            <Button size="$4" onPress={() => router.back()}>
              Back to Home
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="$4" textAlign="center" color="$gray11">
              Send a request to the walk organizer to join this walk.
            </Text>

            <View style={styles.walkDetails}>
              <Text fontSize="$5" fontWeight="600">
                Walk with {walk.organizerName}
              </Text>
              <Text fontSize="$3" color="$gray11">
                Organized by {walk.organizerName}
              </Text>
              <Text fontSize="$3" color="$gray11">
                {new Date(walk.date.toDate()).toLocaleString()} •{" "}
                {walk.durationMinutes} minutes
              </Text>
              <Text fontSize="$3" color="$gray11" marginTop="$2">
                {walk.location.name}
              </Text>
            </View>

            <Button
              size="$5"
              theme="blue"
              onPress={handleRequestToJoin}
              disabled={loading}
              style={styles.checkInButton}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                "I'm Interested in Joining"
              )}
            </Button>

            <Button size="$4" chromeless onPress={() => router.back()}>
              Go Back
            </Button>
          </>
        )}
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
