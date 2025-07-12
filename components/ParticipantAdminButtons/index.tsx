import { firestore_instance } from "@/config/firebase";
import { COLORS } from "@/styles/colors";
import {
  deleteField,
  doc,
  serverTimestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Check, X } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Button, Text, YStack } from "tamagui";

interface Props {
  walkId: string;
  participantId: string;
  isDenied: boolean;
}

export const ParticipantAdminButtons = ({
  walkId,
  participantId,
  isDenied,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError("");
      const participantRef = doc(
        firestore_instance,
        `walks/${walkId}/participants/${participantId}`
      );
      await updateDoc(participantRef, {
        acceptedAt: serverTimestamp(),
        deniedAt: null,
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
        deniedAt: serverTimestamp(),
        acceptedAt: deleteField(),
        status: "rejected",
      });
      router.back();
    } catch (error) {
      console.error("Error rejecting participant:", error);
      setError("Failed to decline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack space="$4">
      {error ? (
        <Text color="$red10" textAlign="center">
          {error}
        </Text>
      ) : null}

      {isDenied ? (
        <Button
          size="$5"
          backgroundColor={COLORS.success}
          color="white"
          icon={<Check color="white" />}
          onPress={handleApprove}
          disabled={loading}
        >
          {loading ? "Approving..." : "Approve"}
        </Button>
      ) : (
        <Button
          size="$5"
          backgroundColor="$red10"
          color="white"
          icon={<X color="white" />}
          onPress={handleReject}
          disabled={loading}
        >
          {loading ? "Declining..." : "Remove from walk"}
        </Button>
      )}
    </YStack>
  );
};
