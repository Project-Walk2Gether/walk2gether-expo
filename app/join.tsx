import { ActionButton } from "@/components/ActionButton";
import AuthScenicLayout from "@/components/Auth/AuthScenicLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useQuery } from "@/utils/firestore";
import { createFriendship } from "@/utils/invitation";
import { getInitials } from "@/utils/userUtils";
import { collection, query, where } from "@react-native-firebase/firestore";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";

export default function JoinScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [creatingFriendship, setCreatingFriendship] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { showMessage } = useFlashMessage();

  // Create the query to find users with matching invitation code
  const inviterQuery = code
    ? query(
        collection(firestore_instance, "users"),
        where("friendInvitationCode", "==", code)
      )
    : undefined;

  // Use the useQuery hook to fetch the data
  const { docs: inviterDocs, status } = useQuery(inviterQuery);
  const isLoading = status === "loading";

  // Get the first matching user (there should only be one)
  const inviterDoc = inviterDocs?.[0];
  const inviter = inviterDoc
    ? {
        id: inviterDoc.id,
        name: inviterDoc.name || "Unknown",
        profilePicUrl: inviterDoc.profilePicUrl,
      }
    : null;

  const handleGoHomeButtonPress = useCallback(() => {
    router.push("/");
  }, []);

  // Set error if no code provided
  useEffect(() => {
    if (!code) {
      setError("No invitation code provided.");
    } else if (status === "success" && inviterDocs.length === 0) {
      setError("Invitation code not found.");
    } else {
      setError(null);
    }
  }, [code, status, inviterDocs]);

  // Redirect to auth if user is not authenticated
  // Create friendship when accepting an invitation
  const handleAcceptInvitation = async () => {
    if (!user || !inviter) return;

    try {
      setCreatingFriendship(true);

      // Don't allow creating a friendship with yourself
      if (user.uid === inviter.id) {
        setCreatingFriendship(false);
        showMessage("You cannot add yourself as a friend", "error");
        return;
      }

      // Use the createFriendship utility function
      await createFriendship(user.uid, inviter.id);

      // Show success message
      showMessage(`You are now friends with ${inviter.name}!`, "success");

      // Navigate to the friends tab
      router.replace("/(app)/(tabs)/friends");
    } catch (err) {
      console.error("Error creating friendship:", err);
      showMessage("Failed to accept invitation", "error");
      setCreatingFriendship(false);
    }
  };

  // Redirect unauthenticated users with invitation data directly to auth
  if (!user && inviter) {
    return <Redirect href={`/auth?referredByUid=${inviter.id}`} />;
  }

  return (
    <AuthScenicLayout>
      <YStack jc="center" ai="center" p="$4" gap="$4">
        {isLoading ? (
          <Spinner size="large" />
        ) : error ? (
          <>
            <Text color="$red10" mb="$4">
              {error}
            </Text>
            <ActionButton onPress={handleGoHomeButtonPress} label="Go home" />
          </>
        ) : inviter ? (
          <YStack ai="center" gap="$4">
            {/* For the inviter, we manually handle their userData instead of using useDoc (since we already have it) */}
            {inviter.profilePicUrl ? (
              <YStack width={96} height={96}>
                <UserAvatar
                  uid={inviter.id}
                  size={96}
                  backgroundColor="$primary"
                  borderWidth={3}
                />
              </YStack>
            ) : (
              <YStack
                width={96}
                height={96}
                borderRadius={48}
                backgroundColor="$primary"
                justifyContent="center"
                alignItems="center"
                borderWidth={3}
                borderColor="#fff"
              >
                <Text color="white" fontSize={38} fontWeight="bold">
                  {getInitials(inviter.name)}
                </Text>
              </YStack>
            )}

            <Text fontSize={24} fontWeight="600" textAlign="center">
              {inviter.name}
            </Text>

            <Text fontSize={18} textAlign="center" opacity={0.8}>
              has invited you to join Walk2Gether
            </Text>

            {user ? (
              <XStack gap="$2">
                <Button
                  backgroundColor="$gray5"
                  color="$gray11"
                  pressStyle={{ opacity: 0.8 }}
                  fontSize={16}
                  fontWeight="600"
                  borderRadius={10}
                  paddingHorizontal={20}
                  disabled={creatingFriendship}
                  onPress={() => router.replace("/")}
                >
                  Skip
                </Button>
                <Button
                  backgroundColor="$primary"
                  color="white"
                  pressStyle={{ opacity: 0.8 }}
                  fontSize={16}
                  fontWeight="600"
                  borderRadius={10}
                  paddingHorizontal={25}
                  disabled={creatingFriendship}
                  onPress={handleAcceptInvitation}
                >
                  {creatingFriendship ? (
                    <XStack gap="$2" ai="center">
                      <Spinner color="white" size="small" />
                      <Text color="white">Creating...</Text>
                    </XStack>
                  ) : (
                    "Accept Invitation"
                  )}
                </Button>
              </XStack>
            ) : null}
          </YStack>
        ) : null}
      </YStack>
    </AuthScenicLayout>
  );
}
