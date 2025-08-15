import DateTimePickerComponent from "@/components/DateTimePicker";
import UserList from "@/components/UserList";
import { Screen } from "@/components/UI";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/context/FriendsContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { firestore_instance } from "@/config/firebase";
import { getFriendData, getFriendId } from "@/utils/friendshipUtils";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "@react-native-firebase/firestore";
import { format } from "date-fns";
import React, { useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { Button, Card, H4, Separator, Text, XStack, YStack } from "tamagui";

// Availability Tab Screen
export default function AvailabilityScreen() {
  const { user } = useAuth();
  const { friendships, loading: friendshipsLoading } = useFriends();
  const { showMessage } = useFlashMessage();

  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<Date[]>([]);
  const [addingTime, setAddingTime] = useState(false);
  const [dateCandidate, setDateCandidate] = useState<Date>(new Date());
  const [timeCandidate, setTimeCandidate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  // Build a flat list of friend user objects for UserList
  const friendUsers = useMemo(() => {
    return friendships
      .map((f) => {
        const data = getFriendData(f, user?.uid);
        const id = getFriendId(f, user?.uid);
        if (!data || !id) return null;
        return {
          id,
          name: data.name as string,
          profilePicUrl: (data as any).profilePicUrl || null,
        };
      })
      .filter(Boolean) as Array<{ id: string; name: string; profilePicUrl?: string | null }>; 
  }, [friendships, user?.uid]);

  const toggleFriend = (friendId: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const addTimeFromCandidate = () => {
    // Merge date + time into one Date
    const merged = new Date(dateCandidate);
    merged.setHours(timeCandidate.getHours(), timeCandidate.getMinutes(), 0, 0);

    // Prevent duplicates by millis
    const millis = merged.getTime();
    if (!selectedTimes.find((t) => t.getTime() === millis)) {
      setSelectedTimes((prev) => [...prev, merged].sort((a, b) => a.getTime() - b.getTime()));
    }
    setAddingTime(false);
  };

  const removeTime = (millis: number) => {
    setSelectedTimes((prev) => prev.filter((t) => t.getTime() !== millis));
  };

  const canAnnounce = selectedFriendIds.length > 0 && selectedTimes.length > 0 && !!user && !submitting;

  const handleAnnounce = async () => {
    if (!user) return;
    if (!canAnnounce) return;

    try {
      setSubmitting(true);

      // Prepare Firestore payload
      const times = selectedTimes.map((d) => Timestamp.fromDate(d));

      await addDoc(collection(firestore_instance, "availabilities"), {
        createdByUid: user.uid,
        times,
        friendIds: selectedFriendIds,
        createdAt: serverTimestamp(),
        platform: Platform.OS,
      });

      showMessage("Availability announced to selected friends", "success");
      // Reset state
      setSelectedFriendIds([]);
      setSelectedTimes([]);
    } catch (e) {
      console.error("Failed to announce availability", e);
      showMessage("Failed to announce availability. Please try again.", "error");
      Alert.alert("Error", "Could not announce availability. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Availability" gradientVariant="modern" useTopInsets>
      <YStack gap="$4" px={20} pb={20}>
        {/* Times Section */}
        <YStack gap="$3">
          <H4>Times that suit you</H4>

          {/* Selected time chips/cards */}
          {selectedTimes.length === 0 ? (
            <Text color="$gray10">No times selected yet.</Text>
          ) : (
            <YStack gap="$2">
              {selectedTimes.map((d) => (
                <Card key={d.getTime()} padding="$3" backgroundColor="white" borderColor="$gray5" borderWidth={1}>
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text>
                      {format(d, "EEE, MMM d, yyyy • h:mm a")}
                    </Text>
                    <Button size="$2" onPress={() => removeTime(d.getTime())}>
                      Remove
                    </Button>
                  </XStack>
                </Card>
              ))}
            </YStack>
          )}

          {!addingTime ? (
            <Button size="$4" theme="blue" onPress={() => setAddingTime(true)}>
              Add a time
            </Button>
          ) : (
            <YStack gap="$3">
              <DateTimePickerComponent
                selectedDate={dateCandidate}
                selectedTime={timeCandidate}
                onDateChange={setDateCandidate}
                onTimeChange={setTimeCandidate}
              />
              <XStack gap="$2">
                <Button size="$4" theme="green" onPress={addTimeFromCandidate}>
                  Add this time
                </Button>
                <Button size="$4" theme="gray" onPress={() => setAddingTime(false)}>
                  Cancel
                </Button>
              </XStack>
            </YStack>
          )}
        </YStack>

        <Separator />

        {/* Friends Section */}
        <YStack gap="$3">
          <H4>Select friends to notify</H4>
          <UserList
            users={friendUsers as any}
            onSelectUser={(u) => toggleFriend(u.id)}
            searchEnabled
            selectedUserIds={selectedFriendIds}
            loading={friendshipsLoading}
            emptyMessage="You have no friends yet. Invite a friend to get started!"
          />
        </YStack>

        {/* Submit */}
        <YStack gap="$2" mt="$4">
          <Button
            size="$5"
            backgroundColor={canAnnounce ? "$blue10" : "$gray6"}
            color="white"
            disabled={!canAnnounce}
            onPress={handleAnnounce}
          >
            {submitting ? "Announcing..." : "Announce availability"}
          </Button>
          <Text color="$gray10" fontSize={12}>
            Your selected friends will see your available times so you can coordinate a walk.
          </Text>
        </YStack>
      </YStack>
    </Screen>
  );
}
