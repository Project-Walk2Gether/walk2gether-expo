import React, { useState } from "react";
import { Button, H4, Input, YStack } from "tamagui";
import { MeetupWalk, Walk, WithId, walkIsMeetupWalk } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  roundIndex: number;
  onClose: () => void;
}

export function EditUpcomingRoundSheet({ walk, roundIndex, onClose }: Props) {
  // Get the current prompt from the questionPrompts array if it's a meetup walk
  // or from the upcomingRounds as a fallback for backward compatibility
  const meetupWalk = walkIsMeetupWalk(walk)
    ? (walk as WithId<MeetupWalk>)
    : null;
  const questionPrompts = meetupWalk ? meetupWalk.questionPrompts || [] : [];

  const initialPrompt =
    meetupWalk && questionPrompts[roundIndex]
      ? questionPrompts[roundIndex]
      : (walk.upcomingRounds || [])[roundIndex]?.questionPrompt || "";

  const [promptText, setPromptText] = useState(initialPrompt);

  const handleSavePrompt = async () => {
    if (walkIsMeetupWalk(walk)) {
      // Update the questionPrompts array in the walk document
      const meetupWalk = walk as WithId<MeetupWalk>;
      const updatedPrompts = [...(meetupWalk.questionPrompts || [])];

      // Ensure the array is long enough
      while (updatedPrompts.length <= roundIndex) {
        updatedPrompts.push("");
      }

      updatedPrompts[roundIndex] = promptText;

      const updatedRounds = [...(walk.upcomingRounds || [])];
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        questionPrompt: promptText,
      };

      await walk._ref.update({
        questionPrompts: updatedPrompts,
        upcomingRounds: updatedRounds,
      });
    }

    // Close the bottom sheet
    onClose();
  };

  return (
    <YStack padding="$4" space="$4">
      <H4>Edit Question Prompt</H4>

      <Input
        value={promptText}
        onChangeText={setPromptText}
        placeholder="Enter a question for this round..."
        multiline
        numberOfLines={3}
        backgroundColor="white"
        borderWidth={1}
        borderColor="#e0e0e0"
        borderRadius="$4"
        paddingHorizontal="$3"
        paddingVertical="$2"
      />
      <Button backgroundColor="$blue8" color="white" onPress={handleSavePrompt}>
        Save
      </Button>
    </YStack>
  );
}
