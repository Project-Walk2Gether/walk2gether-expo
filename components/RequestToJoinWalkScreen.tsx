import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import {
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, Text, View, YStack } from "tamagui";
import { Participant, Walk, WithId } from "walk2gether-shared";
import { BrandGradient } from "./UI";
import WalkCard from "./WalkCard";

interface RequestToJoinScreenProps {
  walk: WithId<Walk>;
}

export default function RequestToJoinScreen({
  walk,
}: RequestToJoinScreenProps) {
  const navigation = useNavigation();

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { doc: participantDoc } = useDoc<Participant>(
    `walks/${walk.id}/participants/${user?.uid}`
  );
  const requestSent = !!participantDoc;
  const requestCancelled = participantDoc?.cancelledAt !== undefined;
  const isActivePending = requestSent && !requestCancelled;

  // Set navigation header options
  useEffect(() => {
    navigation.setOptions({
      title: isActivePending
        ? "Request Sent!"
        : `Request to join ${walk.organizerName}`,
    });
  }, [navigation, walk.organizerName, isActivePending]);

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
        route: null,
        status: "pending",
        navigationMethod: "driving",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(participantRef, participant, { merge: true });
    } catch (error) {
      console.error("Error requesting to join:", error);
      Alert.alert("Error", "Failed to send join request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!user || !walk?.id || !participantDoc) return;

    setLoading(true);
    try {
      const participantRef = doc(
        firestore_instance,
        `walks/${walk.id}/participants/${user.uid}`
      );

      await updateDoc(participantRef, {
        cancelledAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: "pending",
      });
    } catch (error) {
      console.error("Error cancelling join request:", error);
      Alert.alert("Error", "Failed to cancel request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrandGradient style={{ flex: 1 }} variant="vibrant">
      <YStack p="$4" f={1} paddingBottom={insets.bottom} ai="center">
        <Card
          elevate
          bordered
          width="100%"
          maxWidth={400}
          p={0}
          br={18}
          bg="#fff"
          shadowColor="#000"
          shadowOpacity={0.08}
          shadowRadius={12}
          shadowOffset={{ width: 0, height: 2 }}
          overflow="hidden"
        >
          <YStack gap="$4" ai="center" p="$5">
            {isActivePending ? (
              <>
                <Text fontSize="$4" textAlign="center" color="$gray11">
                  Your neighbor needs to approve your request to join.
                </Text>
                <WalkCard walk={walk} />

                <Button
                  size="$5"
                  w="100%"
                  bg="$red9"
                  color="white"
                  onPress={handleCancelRequest}
                  disabled={loading}
                  mt="$4"
                  pressStyle={{ opacity: 0.8 }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    "Cancel Request"
                  )}
                </Button>
              </>
            ) : requestCancelled ? (
              <>
                <Text fontSize="$4" textAlign="center" color="$gray11">
                  You can send a new request if you'd like to join this walk.
                </Text>
                <WalkCard walk={walk} />

                <Button
                  size="$5"
                  w="100%"
                  bg={COLORS.primary}
                  color="white"
                  onPress={handleRequestToJoin}
                  disabled={loading}
                  mt="$4"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    "Send New Request"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Text fontSize="$4" textAlign="center" color="$gray11">
                  Send a request to your neighbor organizer to join this walk.
                </Text>
                <View>
                  <WalkCard walk={walk} />
                </View>
                <Button
                  size="$5"
                  w="100%"
                  bg={COLORS.primary}
                  color="white"
                  onPress={handleRequestToJoin}
                  disabled={loading}
                  mt="$2"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    "I'm Interested in Joining"
                  )}
                </Button>
              </>
            )}
          </YStack>
        </Card>
      </YStack>
    </BrandGradient>
  );
}
