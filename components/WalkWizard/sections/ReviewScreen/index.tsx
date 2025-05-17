import { useWalkForm } from "@/context/WalkFormContext";
import { Calendar, Clock, MapPin } from "@tamagui/lucide-icons";
import { differenceInMinutes, format } from "date-fns";
import React from "react";
import { Card, Separator, Text, YStack } from "tamagui";
import NeighborhoodWalkHowItWorksSection from "../NeighborhoodConfirmationScreen/NeighborhoodWalkHowItWorksSection";
import WizardWrapper from "../WizardWrapper";
import ReviewItem from "./ReviewItem";

const pluralize = require("pluralize");

interface Props {
  onSubmit: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
}

export const ReviewScreen: React.FC<Props> = ({ onSubmit, onBack, onEdit }) => {
  const { formData, errors, isValid } = useWalkForm();

  // Determine if walk is less than 30 minutes from now
  const isSoon = React.useMemo(() => {
    if (!formData.date) return false;

    const walkDate = formData.date.toDate();
    const now = new Date();

    // Check if time until walk is less than 30 minutes
    const minutesUntilWalk = differenceInMinutes(walkDate, now);
    return minutesUntilWalk >= 0 && minutesUntilWalk < 30;
  }, [formData.date]);

  return (
    <WizardWrapper
      onContinue={onSubmit}
      onBack={onBack}
      continueText={isSoon ? "I'm all set!" : "Create Walk"}
    >
      <YStack gap="$4">
        <Card
          backgroundColor="rgba(255, 255, 255, 0.95)"
          padding="$4"
          borderRadius={16}
        >
          <YStack gap="$4">
            <ReviewItem
              icon={Calendar}
              title="Date & Time"
              content={
                formData.date
                  ? format(formData.date.toDate(), "EEEE MMMM d, yyyy h:mm a")
                  : "Not set"
              }
              onEdit={() => onEdit(1)}
              error={errors.date}
            />

            <Separator />

            <ReviewItem
              icon={Clock}
              title="Duration"
              content={
                formData.durationMinutes
                  ? `${formData.durationMinutes} minutes`
                  : "Not set"
              }
              onEdit={() => onEdit(2)}
              error={errors.durationMinutes}
            />

            <Separator />

            <ReviewItem
              icon={MapPin}
              title="Location"
              content={
                <YStack flex={1}>
                  <Text fontSize={16} color="$gray12" numberOfLines={1}>
                    {formData.startLocation?.name || "Not set"}
                  </Text>
                  {formData.type === "neighborhood" && (
                    <Text fontSize={14} color="$gray11" numberOfLines={2}>
                      {formData.invitedUserIds &&
                      formData.invitedUserIds.length > 0
                        ? `${pluralize(
                            "Walk2Gether member",
                            formData.invitedUserIds.length,
                            true
                          )} will be notified`
                        : "No members found in this area"}
                    </Text>
                  )}
                </YStack>
              }
              onEdit={() => onEdit(3)}
              error={errors.startLocation || errors.invitedUserIds}
            />
          </YStack>
        </Card>

        {/* Display validation status */}
        {!isValid && (
          <Card
            backgroundColor="rgba(255, 220, 220, 0.95)"
            padding="$3"
            borderRadius={16}
          >
            <Text color="$red10" fontWeight="500" textAlign="center">
              Please complete all required fields before creating your walk
            </Text>
          </Card>
        )}

        {/* Render the how it works section for neighborhood walks */}
        {formData.type === "neighborhood" && (
          <NeighborhoodWalkHowItWorksSection />
        )}
      </YStack>
    </WizardWrapper>
  );
};

export default ReviewScreen;
