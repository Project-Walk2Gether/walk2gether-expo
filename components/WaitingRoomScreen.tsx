import { firestore_instance } from "@/config/firebase";
import { useWaitingParticipants } from "@/hooks/useWaitingParticipants";
import {
  doc,
  FirebaseFirestoreTypes,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import React from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Card,
  Image,
  ScrollView,
  Separator,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { Participant, Walk, WithId } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  onBack: () => void;
}

export default function WaitingRoomScreen({ walk, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const waitingParticipants = useWaitingParticipants(walk.id!);

  const handleAccept = async (participant: WithId<Participant>) => {
    try {
      // Add to participants collection
      await updateDoc(
        participant._ref as FirebaseFirestoreTypes.DocumentReference<Participant>,
        {
          acceptedAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        }
      );

      Alert.alert("Success", "User has been approved to join the walk");
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to approve user. Please try again.");
    }
  };

  const handleDecline = async (participant: WithId<Participant>) => {
    if (!walk?.id) return;

    try {
      const participantRef = doc(
        firestore_instance,
        `walks/${walk.id}/participants/${participant.id}`
      );
      await updateDoc(participantRef, { rejectedAt: Timestamp.now() });
      Alert.alert("Success", "Request has been declined");
    } catch (error) {
      console.error("Error declining request:", error);
      Alert.alert("Error", "Failed to decline request. Please try again.");
    }
  };

  return (
    <View flex={1} backgroundColor="#fff" paddingBottom={insets.bottom}>
      <ScrollView>
        <YStack padding="$4" space="$4">
          <Text fontSize="$7" fontWeight="bold">
            Waiting Room
          </Text>

          <Text fontSize="$4" color="$gray11">
            {waitingParticipants.length === 0
              ? "No one has requested to join your walk yet."
              : `${waitingParticipants.length} ${
                  waitingParticipants.length === 1 ? "person" : "people"
                } waiting to join your walk.`}
          </Text>

          {waitingParticipants.length > 0 && (
            <YStack space="$3" marginTop="$2">
              {waitingParticipants.map((participant) => (
                <Card key={participant.id} padding="$4">
                  <XStack alignItems="center" gap="$3">
                    {participant.photoURL ? (
                      <Image
                        source={{ uri: participant.photoURL }}
                        width={50}
                        height={50}
                        borderRadius={25}
                      />
                    ) : (
                      <View
                        width={50}
                        height={50}
                        borderRadius={25}
                        backgroundColor="$gray5"
                      />
                    )}
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600">
                        {participant.displayName}
                      </Text>
                      <Text fontSize="$3" color="$gray11">
                        Requested{" "}
                        {participant.createdAt!.toDate().toLocaleTimeString()}
                      </Text>
                    </YStack>

                    <XStack space="$2">
                      <Button
                        size="$3"
                        theme="green"
                        onPress={() => handleAccept(participant)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="$3"
                        theme="red"
                        onPress={() => handleDecline(participant)}
                      >
                        Decline
                      </Button>
                    </XStack>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}

          <Separator marginVertical="$4" />

          <Button size="$4" onPress={onBack}>
            Back to Walk
          </Button>
        </YStack>
      </ScrollView>
    </View>
  );
}
