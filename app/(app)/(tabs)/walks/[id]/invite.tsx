import { ContentCard } from "@/components/ContentCard";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import QuoteWithImage from "@/components/QuoteWithImage";
import WalkCard from "@/components/WalkCard";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { COLORS } from "@/styles/colors";
import { useDoc, useQuery } from "@/utils/firestore";
import { collection, query, where } from "@react-native-firebase/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { Link, MapPin, Share2, Users } from "@tamagui/lucide-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Clipboard } from "react-native";
import { Button, ScrollView, Text, View, YStack } from "tamagui";
import { Friendship, Walk } from "walk2gether-shared";
import FriendsList from "../../../../../components/FriendsList";

export default function InviteScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();

  // Get walk data
  const { doc: walk, status: walkStatus } = useDoc<Walk>(`walks/${id}`);
  const walkLoading = walkStatus === "loading";

  // Get the quote advancement function
  // Quote now handled by QuoteWithImage component

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Query friendships for current user where deletedAt is null (not deleted)
  const friendshipsQuery = user?.uid
    ? query(
        collection(firestore_instance, "friendships"),
        where("uids", "array-contains", user.uid),
        where("deletedAt", "==", null)
      )
    : undefined;

  const { docs: friendships } = useQuery<Friendship>(friendshipsQuery);

  // Set initial selected friends based on walk data
  useEffect(() => {
    if (walk?.invitedUserIds) {
      setSelectedFriends(walk.invitedUserIds);
    }
  }, [walk]);

  // Determine if user has any friends
  const hasFriends = friendships && friendships.length > 0;
  const isNeighborhoodWalk = walk?.type === "neighborhood";
  const isFriendsWalk = walk?.type === "friends";

  if (walkLoading || !walk) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Invite Friends",
            headerRight: () => <HeaderCloseButton />,
            headerShadowVisible: false,
          }}
        />
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </>
    );
  }

  // Check if user is the creator of the walk
  if (user?.uid !== walk.createdByUid) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Invite Friends",
            headerRight: () => <HeaderCloseButton />,
            headerShadowVisible: false,
          }}
        />
        <View flex={1} padding="$4" justifyContent="center" alignItems="center">
          <Text fontSize={18} textAlign="center">
            Only the creator of this walk can invite friends.
          </Text>
        </View>
      </>
    );
  }

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        return prev.filter((id) => id !== friendId);
      } else {
        return [...prev, friendId];
      }
    });
  };

  // Generate the invitation link
  const getInvitationLink = () => {
    if (!userData?.friendInvitationCode || !walk.invitationCode) return "";

    return `https://projectwalk2gether.org/join?code=${userData.friendInvitationCode}&walk=${walk.invitationCode}`;
  };

  // Handle sharing the invitation link
  const handleShareLink = async () => {
    const link = getInvitationLink();
    if (!link) {
      showMessage("Unable to generate invitation link", "error");
      return;
    }

    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(link, {
          dialogTitle: "Invite friends to walk",
          mimeType: "text/plain",
          UTI: "public.plain-text",
        });
      } else {
        // Fallback for web or devices where Sharing is not available
        Clipboard.setString(link);
        showMessage("Invitation link copied to clipboard", "success");
      }
    } catch (error) {
      console.error("Error sharing link:", error);
      showMessage("Could not share the invitation link", "error");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Invite Friends",
          headerRight: () => <HeaderCloseButton />,
          headerShadowVisible: false,
        }}
      />
      <LinearGradient
        flex={1}
        colors={["#f7fafc", "#e0e7ef"]}
        start={[0, 0]}
        end={[0, 1]}
      >
        <ScrollView flex={1}>
          <YStack flex={1} gap="$5" padding="$4" paddingTop="$2">
            {/* Display walk details at the top */}
            {walk && (
              <WalkCard
                walk={walk}
                showAttachments={false}
                showActions={false}
                onPress={undefined} /* Explicitly disable navigation */
              />
            )}
            {isNeighborhoodWalk && (
              <ContentCard
                title="Neighborhood Walk"
                icon={<MapPin size={20} color={COLORS.textOnLight} />}
                description="We've invited users within a 1/2 mile radius of your location to join your walk. This is a great way to meet neighbors and make new walking buddies!"
              >
                <Text color={COLORS.primary} fontSize={16} marginTop="$1">
                  Your walk is publicly visible to users in your area.
                </Text>
              </ContentCard>
            )}

            {isFriendsWalk && (
              <YStack gap="$5">
                {hasFriends && (
                  <ContentCard
                    title="Select Friends"
                    icon={<Users size={20} color={COLORS.textOnLight} />}
                    description={`${selectedFriends.length} ${
                      selectedFriends.length === 1 ? "friend" : "friends"
                    } selected`}
                  >
                    <FriendsList
                      onSelectFriend={(friend) => handleFriendToggle(friend.id)}
                      searchEnabled={true}
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      selectedFriendIds={selectedFriends}
                    />
                  </ContentCard>
                )}

                <ContentCard
                  title="Invite friends"
                  icon={<Link size={20} color={COLORS.textOnLight} />}
                  description="Share an invitation link to your walk via text message or your favorite messaging app"
                >
                  <Button
                    backgroundColor={COLORS.primary}
                    color={COLORS.textOnDark}
                    onPress={handleShareLink}
                    size="$4"
                    icon={<Share2 size={18} color="#fff" />}
                    paddingHorizontal={16}
                    borderRadius={8}
                    hoverStyle={{ backgroundColor: "#6d4c2b" }}
                    pressStyle={{ backgroundColor: "#4b2e13" }}
                  >
                    Share Link
                  </Button>
                </ContentCard>

                {/* Only show friends count if there are actual friends selected (excluding the user) */}
                {selectedFriends.length > 1 && (
                  <Text
                    fontSize={16}
                    color={COLORS.textOnLight}
                    marginTop="$2"
                    textAlign="center"
                    fontWeight="600"
                  >
                    {selectedFriends.length - 1}{" "}
                    {selectedFriends.length - 1 === 1 ? "friend" : "friends"}{" "}
                    selected
                  </Text>
                )}
              </YStack>
            )}

            {/* Quote of the day and thumbs up image component */}
            <QuoteWithImage imageSize={200} />
          </YStack>
        </ScrollView>
      </LinearGradient>
    </>
  );
}
