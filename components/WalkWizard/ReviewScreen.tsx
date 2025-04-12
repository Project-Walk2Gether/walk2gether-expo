import { COLORS } from "@/styles/colors";
import { Calendar, Clock, MapPin, Users } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Separator, Text, XStack, YStack } from "tamagui";
import { useWalkForm } from "../../context/WalkFormContext";
import { BrandGradient } from "../UI";

const pluralize = require("pluralize");

interface ReviewScreenProps {
  onSubmit: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  onSubmit,
  onBack,
  onEdit,
}) => {
  const { formData } = useWalkForm();

  const getWalkTypeLabel = () => {
    switch (formData.walkType) {
      case "friends":
        return "Friend Walk";
      case "neighborhood":
        return "Neighborhood Walk";
      default:
        return "Walk";
    }
  };

  return (
    <BrandGradient style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <YStack gap="$4" paddingHorizontal="$4" paddingVertical="$4">
          <Card
            backgroundColor="rgba(255, 255, 255, 0.95)"
            padding="$4"
            borderRadius={16}
          >
            <YStack gap="$4">
              <XStack alignItems="center" gap="$2">
                <Calendar size="$4.5" color="$blue10" />
                <YStack>
                  <Text fontSize={16} color="$gray11" fontWeight="600">
                    Date & Time
                  </Text>
                  <Text fontSize={18} color="$gray12">
                    {formData.date
                      ? format(formData.date, "EEEE, MMMM d, yyyy")
                      : "Not set"}
                  </Text>
                  <Text fontSize={18} color="$gray12">
                    {formData.time
                      ? format(formData.time, "h:mm a")
                      : "Not set"}
                  </Text>
                </YStack>
                <Button
                  size="$2"
                  variant="outlined"
                  marginLeft="auto"
                  onPress={() => onEdit(1)}
                >
                  Edit
                </Button>
              </XStack>

              <Separator />

              <XStack alignItems="center" gap="$2">
                <MapPin size="$4.5" color="$blue10" />
                <YStack flex={1}>
                  <Text fontSize={16} color="$gray11" fontWeight="600">
                    Location
                  </Text>
                  <Text fontSize={18} color="$gray12" numberOfLines={1}>
                    {formData.location?.name || "Not set"}
                  </Text>
                  <Text fontSize={14} color="$gray10" numberOfLines={2}>
                    {formData.location?.description || ""}
                  </Text>
                </YStack>
                <Button size="$2" variant="outlined" onPress={() => onEdit(2)}>
                  Edit
                </Button>
              </XStack>

              <Separator />

              <XStack alignItems="center" gap="$2">
                <Clock size="$4.5" color="$blue10" />
                <YStack>
                  <Text fontSize={16} color="$gray11" fontWeight="600">
                    Duration
                  </Text>
                  <Text fontSize={18} color="$gray12">
                    {formData.duration
                      ? `${formData.duration} minutes`
                      : "Not set"}
                  </Text>
                </YStack>
                <Button
                  size="$2"
                  variant="outlined"
                  marginLeft="auto"
                  onPress={() => onEdit(3)}
                >
                  Edit
                </Button>
              </XStack>

              <Separator />

              <XStack alignItems="center" gap="$2">
                <Users size="$4.5" color="$blue10" />
                <YStack>
                  <Text fontSize={16} color="$gray11" fontWeight="600">
                    Participants
                  </Text>
                  {formData.isNeighborhoodWalk ? (
                    <Text fontSize={18} color="$gray12">
                      Open to entire neighborhood
                    </Text>
                  ) : (
                    <Text fontSize={18} color="$gray12">
                      {formData.invitees && formData.invitees.length > 0
                        ? `${pluralize(
                            "friend",
                            formData.invitees.length,
                            true
                          )} invited`
                        : "No one invited yet"}
                    </Text>
                  )}
                </YStack>
                <Button
                  size="$2"
                  variant="outlined"
                  marginLeft="auto"
                  onPress={() => onEdit(4)}
                >
                  Edit
                </Button>
              </XStack>
            </YStack>
          </Card>

          <XStack gap="$4" justifyContent="space-between" marginTop="$6">
            <Button
              size="$5"
              backgroundColor={COLORS.actionSecondary}
              color={COLORS.textOnDark}
              onPress={onBack}
              flex={1}
            >
              Back
            </Button>
            <Button
              size="$5"
              backgroundColor={COLORS.action}
              color={COLORS.textOnDark}
              onPress={onSubmit}
              flex={1}
            >
              Create Walk
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </BrandGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default ReviewScreen;
