import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import { updateDoc } from "@react-native-firebase/firestore";
import { Edit3 } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Slider, Text, XStack, YStack } from "tamagui";
import { MeetupWalk, WithId } from "walk2gether-shared";

interface Props {
  walk: WithId<MeetupWalk>;
}

export default function WalkMinimumMinutesForm({ walk }: Props) {
  const [minutes, setMinutes] = useState(
    walk.minimumNumberOfMinutesWithEachPartner || 5
  );
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  // Check if form is dirty (different from saved value)
  const isDirty = minutes !== (walk.minimumNumberOfMinutesWithEachPartner || 5);

  // Reset local state when walk prop changes
  useEffect(() => {
    setMinutes(walk.minimumNumberOfMinutesWithEachPartner || 5);
  }, [walk.minimumNumberOfMinutesWithEachPartner]);

  const handleSave = async () => {
    if (!walk._ref || !isDirty) return;

    try {
      setLoading(true);
      await updateDoc(walk._ref as any, {
        minimumNumberOfMinutesWithEachPartner: minutes,
      });
    } catch (error) {
      console.error("Error updating minimum minutes:", error);
      Alert.alert(
        "Error",
        "Failed to update minimum minutes with each partner"
      );
      // Reset to original value on error
      setMinutes(walk.minimumNumberOfMinutesWithEachPartner || 5);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMinutes(walk.minimumNumberOfMinutesWithEachPartner || 5);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveAndClose = async () => {
    await handleSave();
    setEditing(false);
  };

  return (
    <WalkDetailsCard
      title="Minimum round duration"
      headerAction={
        !editing ? (
          <Button
            mt="$2"
            size="$2"
            theme="blue"
            iconAfter={<Edit3 size={16} />}
            onPress={handleEdit}
          >
            Edit
          </Button>
        ) : undefined
      }
    >
      <YStack w="100%" gap="$3">
        {editing ? (
          // Edit mode - show slider
          <YStack gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$3" color="$gray8">
                2 min
              </Text>
              <Text fontSize="$5" fontWeight="600" color="$blue10">
                {minutes} minutes
              </Text>
              <Text fontSize="$3" color="$gray8">
                20 min
              </Text>
            </XStack>

            <Slider
              size="$4"
              width="100%"
              value={[minutes]}
              onValueChange={(value) => setMinutes(value[0])}
              min={2}
              max={20}
              step={1}
            >
              <Slider.Track>
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb circular index={0} />
            </Slider>

            <XStack gap="$2" justifyContent="flex-end">
              <Button
                size="$3"
                variant="outlined"
                onPress={handleReset}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="$3"
                theme="blue"
                onPress={handleSaveAndClose}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </XStack>
          </YStack>
        ) : (
          // Read-only mode - show current value
          <YStack gap="$2">
            <XStack alignItems="center">
              <Text fontSize="$6" fontWeight="600" color="$blue10">
                {walk.minimumNumberOfMinutesWithEachPartner || 5} minutes
              </Text>
            </XStack>
            <Text fontSize="$3" color="$gray10">
              Rounds won't be shorter than this, but may be longer, to fill up
              the available time.
            </Text>
          </YStack>
        )}
      </YStack>
    </WalkDetailsCard>
  );
}
