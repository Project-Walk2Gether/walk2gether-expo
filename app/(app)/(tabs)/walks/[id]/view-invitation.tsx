import { useErrorReporting } from "@/components/ErrorBoundary";
import HeaderBackButton from "@/components/HeaderBackButton";
import QuoteWithImage from "@/components/QuoteWithImage";
import { BrandGradient } from "@/components/UI";
import WalkCard from "@/components/WalkCard";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { useDoc } from "@/utils/firestore";
import {
  deleteField,
  doc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { Check } from "@tamagui/lucide-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Checkbox,
  Input,
  Label,
  ScrollView,
  Text,
  XStack,
  YStack,
} from "tamagui";
import {
  Participant,
  Walk,
  walkIsNeighborhoodWalk,
  WithId,
} from "walk2gether-shared";

// Higher Order Component that fetches the walk data
function withWalkData<P extends { walk: WithId<Walk> }>(
  Component: React.ComponentType<P>
) {
  return function WithWalkDataWrapper(props: Omit<P, "walk">) {
    const { id } = useLocalSearchParams();
    const { doc: walk } = useDoc<WithId<Walk>>(`walks/${id}`);

    // Return null until we have the walk data
    if (!walk) return null;

    // Once we have the walk data, render the inner component with walk as prop
    return <Component {...(props as P)} walk={walk} />;
  };
}

// Inner component that expects the walk data to be passed as a prop
function ViewWalkInvitationScreen({ walk }: { walk: WithId<Walk> }) {
  const { reportNonFatalError } = useErrorReporting();
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { userData, updateUserData } = useUserData();
  const { userLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const [introduction, setIntroduction] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(false);
  const { doc: participantDoc } = useDoc<Participant>(
    `walks/${walk.id}/participants/${user?.uid}`
  );
  const requestSent = !!participantDoc;
  const cantMakeIt = participantDoc?.cancelledAt !== undefined;
  const isPending = requestSent && !cantMakeIt;

  // Set navigation header options
  useEffect(() => {
    navigation.setOptions({
      title: isPending
        ? "You've joined this walk!"
        : `Join ${walk.organizerName}'s walk`,
      headerLeft: () => <HeaderBackButton />,
    });
  }, [navigation, walk.organizerName, isPending]);

  // Common function to handle walk actions (accept or cancel)
  const handleWalkAction = async (action: "accept" | "cancel") => {
    if (!user || !walk?.id) return;

    setLoading(true);

    try {
      // Create a request document for the user
      const participantId = user.uid; // Use the user's ID as the request ID
      const participantRef = doc(
        firestore_instance,
        `walks/${walk.id}/participants/${participantId}`
      );

      // Prepare common participant data fields
      const commonFields = {
        userUid: user.uid,
        displayName: userData?.name || "Anonymous",
        photoURL: userData?.profilePicUrl || null,
        sourceType: "requested" as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (action === "accept") {
        // Only include introduction for neighborhood walks
        const introductionValue = walkIsNeighborhoodWalk(walk)
          ? introduction.trim()
          : "";

        // Update existing participant document with acceptance data
        await updateDoc(participantRef, {
          ...commonFields,
          acceptedAt: Timestamp.now(),
          lastLocation: userLocation
            ? {
                latitude: userLocation?.coords.latitude || 0,
                longitude: userLocation?.coords.longitude || 0,
                timestamp: Timestamp.now(),
              }
            : undefined,
          route: null,
          introduction: introductionValue, // Only include introduction for neighborhood walks
          navigationMethod: "driving",
          cancelledAt: deleteField(),
          updatedAt: Timestamp.now(),
        });

        // If user chose to save introduction to profile, update user data
        // Only applicable for neighborhood walks
        if (
          walkIsNeighborhoodWalk(walk) &&
          saveToProfile &&
          introduction.trim() &&
          userData
        ) {
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
      } else if (action === "cancel") {
        // Update existing participant document with cancellation data
        await updateDoc(participantRef, {
          ...commonFields,
          cancelledAt: Timestamp.now(),
          acceptedAt: deleteField(),
          updatedAt: Timestamp.now(),
        });
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      const actionText = action === "accept" ? "join" : "cancel";
      const errorMessage = `Failed to ${actionText} walk. Please try again.`;

      // Report non-fatal error to Crashlytics with context
      reportNonFatalError(
        error,
        { walkId: walk?.id, action, userId: user?.uid },
        errorMessage
      );

      // Still show the alert to the user
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptButtonPress = () => handleWalkAction("accept");
  const handleCancelButtonPress = () => handleWalkAction("cancel");

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
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom,
          paddingHorizontal: "$2",
        }}
        showsVerticalScrollIndicator={true}
        alwaysBounceVertical={true}
      >
        <YStack p="$4" gap="$4">
          {/* Always render the WalkCard at the top level */}
          <WalkCard walk={walk} showActions={false} />

          <YStack gap="$4" ai="center">
            {isPending ? (
              <>
                <Text fontSize="$4" textAlign="center" color="$gray11">
                  You've successfully joined this walk!
                </Text>
              </>
            ) : cantMakeIt ? (
              <>
                <Button
                  bg={COLORS.primary}
                  color="white"
                  w="100%"
                  onPress={handleAcceptButtonPress}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    "Accept this invitation"
                  )}
                </Button>
              </>
            ) : (
              <>
                {walkIsNeighborhoodWalk(walk) && (
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
                )}

                <YStack space="$2" w="100%">
                  <Button
                    size="$5"
                    w="100%"
                    bg={COLORS.primary}
                    color="white"
                    onPress={handleAcceptButtonPress}
                    disabled={loading}
                    mb="$4"
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : walkIsNeighborhoodWalk(walk) ? (
                      "Join This Walk"
                    ) : (
                      "Accept Invitation"
                    )}
                  </Button>

                  <Button
                    size="$5"
                    w="100%"
                    bg="rgba(255, 0, 0, 0.05)"
                    color="$gray10"
                    onPress={handleCancelButtonPress}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="$gray11" />
                    ) : (
                      "I can't make it"
                    )}
                  </Button>
                </YStack>
              </>
            )}
          </YStack>

          {/* Add motivational quote at the bottom */}
          <QuoteWithImage imageSize={200} />
        </YStack>
      </ScrollView>
    </BrandGradient>
  );
}

export default withWalkData(ViewWalkInvitationScreen);
