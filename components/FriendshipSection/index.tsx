import { firestore_instance } from "@/config/firebase";
import { useFriends } from "@/context/FriendsContext";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { addDoc, collection, serverTimestamp } from "@react-native-firebase/firestore";
import { UserPlus } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Button, Text, YStack } from "tamagui";
import { Friendship, UserData } from "walk2gether-shared";

interface Props {
  participant: UserData;
  participantId: string;
}

export const FriendshipSection = ({ participant, participantId }: Props) => {
  const { user } = useAuth();
  const { friendships, loading: friendshipsLoading } = useFriends();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  // Find if there's an existing friendship between the current user and the participant
  const existingFriendship = friendships.find(
    (friendship) =>
      friendship.uids.includes(user.uid) && 
      friendship.uids.includes(participantId)
  );

  const isPending = existingFriendship && !existingFriendship.acceptedAt;
  const isFriend = existingFriendship && existingFriendship.acceptedAt;
  
  const handleSendFriendRequest = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Create a new friendship document
      await addDoc(collection(firestore_instance, "friendships"), {
        uids: [user.uid, participantId],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdByUid: user.uid,
        // Note: acceptedAt is not set for a friend request
        deletedAt: null,
        userDataByUid: {
          [user.uid]: {
            name: user.displayName || "",
            profilePicUrl: user.photoURL || null,
          },
          [participantId]: {
            name: participant.name || "",
            profilePicUrl: participant.profilePicUrl || null,
          }
        }
      });
      
    } catch (error) {
      console.error("Error sending friend request:", error);
      setError("Failed to send friend request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (friendshipsLoading) {
    return (
      <YStack space="$2" marginTop="$4">
        <Text fontWeight="500">Checking friendship status...</Text>
      </YStack>
    );
  }

  return (
    <YStack space="$4" marginTop="$4" paddingHorizontal="$2">
      <Text fontWeight="500" fontSize="$4">Friendship</Text>
      
      {error ? (
        <Text color="$red10" textAlign="center">
          {error}
        </Text>
      ) : null}

      {isFriend ? (
        <YStack backgroundColor="$green2" padding="$3" borderRadius="$3">
          <Text color="$green10">
            You and {participant.name} are friends
          </Text>
        </YStack>
      ) : isPending ? (
        <YStack backgroundColor="$yellow2" padding="$3" borderRadius="$3">
          <Text color="$yellow10">
            Friend request pending
          </Text>
        </YStack>
      ) : (
        <Button
          size="$4"
          backgroundColor={COLORS.primary}
          color="white"
          icon={<UserPlus color="white" size={16} />}
          onPress={handleSendFriendRequest}
          disabled={loading}
        >
          {loading ? "Sending request..." : "Send friend request"}
        </Button>
      )}
    </YStack>
  );
};
