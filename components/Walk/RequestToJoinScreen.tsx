import { doc, setDoc, Timestamp } from "@react-native-firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, SizableText, Text, View, YStack } from "tamagui";
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
        userUid: user.uid,
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
    <YStack f={1} bg="#fff" paddingBottom={insets.bottom} ai="center">
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
        {/* Large Map at Top */}
        <View width="100%" height={200}>
          <MapView
            style={{
              width: "100%",
              height: "100%",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
            }}
            initialRegion={{
              latitude: walk.location.latitude,
              longitude: walk.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: walk.location.latitude,
                longitude: walk.location.longitude,
              }}
              title={walk.location.name}
            />
          </MapView>
        </View>
        <YStack space="$4" w="100%" ai="center" p="$5">
          {requestSent ? (
            <>
              <SizableText size="$8" fontWeight="bold" textAlign="center">
                Request Sent!
              </SizableText>
              <Text size="$4" textAlign="center" color="$gray11">
                The walk organizer needs to approve your request to join.
              </Text>
              <Card bordered bg="#f5f5f5" p="$4" my="$3" br={14} w="100%">
                <YStack gap="$1">
                  <SizableText size="$6" fontWeight="600">
                    Walk with {walk.organizerName}
                  </SizableText>
                  <Text size="$3" color="$gray11">
                    Organized by {walk.organizerName}
                  </Text>
                  <Text size="$3" color="$gray11">
                    {new Date(walk.date.toDate()).toLocaleString()} •{" "}
                    {walk.durationMinutes} minutes
                  </Text>
                  <Text size="$3" color="$gray11" mt="$2">
                    {walk.location.name}
                  </Text>
                </YStack>
              </Card>
            </>
          ) : (
            <>
              <Text size="$4" textAlign="center" color="$gray11">
                Send a request to the walk organizer to join this walk.
              </Text>
              <Card bordered bg="#f5f5f5" p="$4" my="$3" br={14} w="100%">
                <YStack gap="$1">
                  <SizableText size="$6" fontWeight="600">
                    Walk with {walk.organizerName}
                  </SizableText>
                  <Text size="$3" color="$gray11">
                    Organized by {walk.organizerName}
                  </Text>
                  <Text size="$3" color="$gray11">
                    {new Date(walk.date.toDate()).toLocaleString()} •{" "}
                    {walk.durationMinutes} minutes
                  </Text>
                  <Text size="$3" color="$gray11" mt="$2">
                    {walk.location.name}
                  </Text>
                </YStack>
              </Card>
              <Button
                size="$5"
                w="100%"
                theme="blue"
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
  );
}
