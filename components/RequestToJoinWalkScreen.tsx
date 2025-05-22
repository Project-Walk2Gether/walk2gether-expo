import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendsContext";
import { useLocation } from "@/context/LocationContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import {
  deleteField,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Check } from "@tamagui/lucide-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { Participant, Walk, WithId } from "walk2gether-shared";
import QuoteWithImage from "./QuoteWithImage";
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
  const { userData, updateUserData } = useUserData();
  const { userLocation } = useLocation();
  const { friendships } = useFriends();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [introduction, setIntroduction] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);

  const { doc: participantDoc } = useDoc<Participant>(
    `walks/${walk.id}/participants/${user?.uid}`
  );
  const requestSent = !!participantDoc;
  const requestCancelled = participantDoc?.cancelledAt !== undefined;
  const isActivePending = requestSent && !requestCancelled;

  // Check if user is friends with the walk organizer
  const isFriendWithOrganizer = friendships.some((friendship) => {
    return friendship.uids.includes(walk.createdByUid);
  });

  // Set navigation header options
  useEffect(() => {
    navigation.setOptions({
      title: isActivePending
        ? "Request Sent!"
        : isFriendWithOrganizer
        ? `Join ${walk.organizerName}'s walk`
        : `Request to join ${walk.organizerName}`,
    });
  }, [navigation, walk.organizerName, isActivePending, isFriendWithOrganizer]);

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
        displayName: userData?.name || "Anonymous",
        photoURL: userData?.profilePicUrl || null,
        acceptedAt: isFriendWithOrganizer ? Timestamp.now() : null,
        lastLocation: {
          latitude: userLocation?.coords.latitude || 0,
          longitude: userLocation?.coords.longitude || 0,
          timestamp: Timestamp.now(),
        },
        route: null,
        introduction: introduction.trim(), // Add the introduction
        status: "pending",
        navigationMethod: "driving",
        cancelledAt: deleteField() as any,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log("HERE");

      // Save participant document
      await setDoc(participantRef, participant, { merge: true });

      // If user chose to save introduction to profile, update user data
      if (saveToProfile && introduction.trim() && userData) {
        try {
          const userRef = doc(firestore_instance, `users/${user.uid}`);
          await updateDoc(userRef, {
            aboutMe: introduction.trim(),
            updatedAt: Timestamp.now(),
          });

          // Update local user data context
          updateUserData({
            ...userData,
            aboutMe: introduction.trim(),
          });
        } catch (error) {
          console.error("Error saving introduction to profile:", error);
          // We don't want to fail the whole request if this part fails
        }
      }
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
    <BrandGradient style={{ flex: 1 }} variant="modern">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <YStack p="$4" ai="center" gap="$6">
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
                    {isFriendWithOrganizer
                      ? "You can join this walk immediately since you're friends with the organizer."
                      : "Send a request to your neighbor organizer to join this walk."}
                  </Text>
                  <View>
                    <WalkCard walk={walk} />
                  </View>

                  <YStack gap="$2" w="100%" mt="$2">
                    <Label htmlFor="introduction" fontSize="$3" color="$gray11">
                      Introduce Yourself (optional)
                    </Label>
                    <Input
                      id="introduction"
                      size="$4"
                      placeholder="Hi, I'm excited to join this walk..."
                      value={introduction}
                      onChangeText={setIntroduction}
                      multiline
                      numberOfLines={3}
                      autoCorrect
                      textAlignVertical="top"
                    />

                    <XStack alignItems="center" gap="$2" marginTop="$1">
                      <Checkbox
                        id="save-to-profile"
                        size="$4"
                        checked={saveToProfile}
                        onCheckedChange={(checked) =>
                          setSaveToProfile(!!checked)
                        }
                      >
                        <Checkbox.Indicator>
                          <Check />
                        </Checkbox.Indicator>
                      </Checkbox>
                      <Label
                        htmlFor="save-to-profile"
                        fontSize="$2"
                        color="$gray11"
                      >
                        Save to my profile for future walks
                      </Label>
                    </XStack>
                  </YStack>

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
                    ) : isFriendWithOrganizer ? (
                      "Join This Walk"
                    ) : (
                      "I'm Interested in Joining"
                    )}
                  </Button>
                </>
              )}
            </YStack>
          </Card>

          {/* Subtle cancel request button (shown only when request is pending) */}
          {isActivePending && (
            <Button
              mt="$4"
              mb="$2"
              // color="$gray10"
              bg="transparent"
              theme="red"
              borderColor="$gray6"
              borderWidth={1}
              size="$3"
              onPress={handleCancelRequest}
              disabled={loading}
              pressStyle={{ opacity: 0.7 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.textSecondary} />
              ) : (
                "Cancel Request"
              )}
            </Button>
          )}

          {/* Add motivational quote at the bottom */}
          <QuoteWithImage imageSize={200} />
        </YStack>
      </ScrollView>
    </BrandGradient>
  );
}
