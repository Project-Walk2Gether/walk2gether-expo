import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { Calendar, Clock, MapPin, Users } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import React from "react";
import { Card, Separator, Text, YStack } from "tamagui";
import WizardWrapper from "../WizardWrapper";
import ReviewItem from "./ReviewItem";

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

  return (
    <WizardWrapper
      onContinue={onSubmit}
      onBack={onBack}
      continueText="Create Walk"
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
                <YStack>
                  <Text fontSize={18} color="$gray12">
                    {formData.date
                      ? format(formData.date.toDate(), "EEEE, MMMM d, yyyy")
                      : "Not set"}
                  </Text>
                  <Text fontSize={18} color="$gray12">
                    {formData.date
                      ? format(formData.date.toDate(), "h:mm a")
                      : "Not set"}
                  </Text>
                </YStack>
              }
              onEdit={() => onEdit(1)}
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
            />

            <Separator />

            <ReviewItem
              icon={MapPin}
              title="Location"
              content={
                <YStack flex={1}>
                  <Text fontSize={18} color="$gray12" numberOfLines={1}>
                    {formData.startLocation?.name || "Not set"}
                  </Text>
                </YStack>
              }
              onEdit={() => onEdit(3)}
            />

            <Separator />

            <ReviewItem
              icon={Users}
              title="Participants"
              content={
                formData.isNeighborhoodWalk ? (
                  <Text fontSize={18} color="$gray12">
                    Open to entire neighborhood
                  </Text>
                ) : (
                  <YStack>
                    <Text fontSize={18} color="$gray12">
                      {(() => {
                        const invitedFriendsCount = (
                          formData.invitedUserIds || []
                        ).length;
                        const invitedPhoneCount = (
                          formData.invitedPhoneNumbers || []
                        ).length;
                        const totalInvited =
                          invitedFriendsCount + invitedPhoneCount;

                        if (totalInvited === 0) {
                          return "No one invited yet";
                        } else {
                          return `${pluralize(
                            "person",
                            totalInvited,
                            true
                          )} invited`;
                        }
                      })()}
                    </Text>
                    {(formData.invitedUserIds?.length || 0) > 0 &&
                      (formData.invitedPhoneNumbers?.length || 0) > 0 && (
                        <Text fontSize={14} color="$gray11">
                          {pluralize(
                            "friend",
                            formData.invitedUserIds?.length || 0,
                            true
                          )}{" "}
                          •{" "}
                          {pluralize(
                            "phone number",
                            formData.invitedPhoneNumbers?.length || 0,
                            true
                          )}
                        </Text>
                      )}
                  </YStack>
                )
              }
              onEdit={() => onEdit(4)}
            />
          </YStack>
        </Card>
      </YStack>
    </WizardWrapper>
  );
};

export default ReviewScreen;
