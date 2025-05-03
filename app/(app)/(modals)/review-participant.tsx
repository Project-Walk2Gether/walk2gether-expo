import {
  doc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Car, Check, X } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import {
  Avatar,
  Button,
  H5,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { ParticipantWithRoute, UserData } from "walk2gether-shared";
import { firestore_instance } from "../../../config/firebase";
import { COLORS } from "../../../styles/colors";
import { useDoc } from "../../../utils/firestore";

export default function ReviewParticipantScreen() {
  const params = useLocalSearchParams();
  const walkId = params.walkId as string;
  const participantId = params.participantId as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the participant data
  const { doc: participant, status: participantStatus } =
    useDoc<ParticipantWithRoute>(
      `walks/${walkId}/participants/${participantId}`
    );

  // Get the user data
  const { doc: userData, status: userDataStatus } = useDoc<UserData>(
    `users/${participantId}`
  );

  const isLoading =
    participantStatus === "loading" || userDataStatus === "loading";

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError("");
      const participantRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${participantId}`
      );
      await updateDoc(participantRef, {
        approvedAt: serverTimestamp(),
        rejectedAt: null,
        status: "approved",
      });
      router.back();
    } catch (error) {
      console.error("Error approving participant:", error);
      setError("Failed to approve participant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      setError("");
      const participantRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${participantId}`
      );
      await updateDoc(participantRef, {
        rejectedAt: serverTimestamp(),
        status: "rejected",
      });
      router.back();
    } catch (error) {
      console.error("Error rejecting participant:", error);
      setError("Failed to reject participant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!participant || !userData) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" padding="$4">
        <Text textAlign="center" color="$red10">
          Participant information not found. They may have been removed or the
          data could not be loaded.
        </Text>
        <Button marginTop="$4" onPress={() => router.back()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4">
        <YStack alignItems="center" space="$3">
          <Avatar size="$10" circular>
            {userData.profilePicUrl ? (
              <Avatar.Image src={userData.profilePicUrl} />
            ) : null}
            <Avatar.Fallback backgroundColor={COLORS.primary}>
              <Text color="white" fontWeight="bold">
                {userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
              </Text>
            </Avatar.Fallback>
          </Avatar>
          <H5>{userData.name || "Unnamed Participant"}</H5>

          <XStack alignItems="center" space="$2">
            <Car size="$1" color={COLORS.text} />
            <Text>
              {participant.navigationMethod === "driving"
                ? "Driving"
                : "Walking"}
            </Text>
          </XStack>

          {/* Friend count could be shown here if available in userData */}
        </YStack>

        {error ? (
          <Text color="$red10" textAlign="center">
            {error}
          </Text>
        ) : null}

        <YStack space="$4" marginTop="$4">
          <Button
            size="$5"
            backgroundColor={COLORS.success}
            color="white"
            icon={<Check color="white" />}
            onPress={handleApprove}
            disabled={loading}
          >
            {loading ? "Approving..." : "Approve Participant"}
          </Button>

          <Button
            size="$5"
            backgroundColor="$red10"
            color="white"
            icon={<X color="white" />}
            onPress={handleReject}
            disabled={loading}
          >
            {loading ? "Rejecting..." : "Reject Participant"}
          </Button>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
