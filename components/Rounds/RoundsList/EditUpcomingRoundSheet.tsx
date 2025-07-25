import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import DurationField from "@/components/WalkForm/components/DurationField";
import React, { useState } from "react";
import { Button, H4, Text, XStack, YStack } from "tamagui";
import { MeetupWalk, Walk, WithId, walkIsMeetupWalk } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  roundIndex: number;
  suggestedDuration?: number; // in minutes
  onClose: () => void;
  onStartRound?: (durationMinutes: number) => void;
  showDurationPicker?: boolean;
  // If isStartingRound is true, will show Start Round button, otherwise Save button
  isStartingRound?: boolean; 
}

export function EditUpcomingRoundSheet({ 
  walk, 
  roundIndex, 
  suggestedDuration = 15,
  onClose,
  onStartRound,
  showDurationPicker = false,
  isStartingRound = false
}: Props) {
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
  const [duration, setDuration] = useState(suggestedDuration);
  
  // Handle starting the round with the selected duration
  const handleStartRound = () => {
    if (onStartRound) {
      onStartRound(duration);
    }
    onClose();
  };

  const handleSavePrompt = async () => {
    try {
      // Always update the prompt regardless of walk type
      const updatedRounds = [...(walk.upcomingRounds || [])];
      
      // Ensure the round exists
      if (!updatedRounds[roundIndex]) {
        console.error("Cannot update non-existent round at index", roundIndex);
        return;
      }
      
      // Update the prompt
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        questionPrompt: promptText,
      };
      
      // If it's a meetup walk, also update the questionPrompts array
      if (walkIsMeetupWalk(walk)) {
        const meetupWalk = walk as WithId<MeetupWalk>;
        const updatedPrompts = [...(meetupWalk.questionPrompts || [])];
        
        // Ensure the array is long enough
        while (updatedPrompts.length <= roundIndex) {
          updatedPrompts.push("");
        }
        
        updatedPrompts[roundIndex] = promptText;
        
        // Update both fields in the walk document
        await walk._ref.update({
          questionPrompts: updatedPrompts,
          upcomingRounds: updatedRounds,
        });
      } else {
        // For non-meetup walks, just update the upcomingRounds
        await walk._ref.update({
          upcomingRounds: updatedRounds,
        });
      }
      
      // If we're in starting round mode, also handle the round start
      if (isStartingRound && onStartRound) {
        onStartRound(duration);
      }
      
      // Close the sheet
      onClose();
    } catch (error) {
      console.error("Error saving round prompt:", error);
    }
  };

  return (
    <YStack padding="$4" space="$4">
      {/* Title based on mode */}
      <H4>{isStartingRound ? "Start Next Round" : "Edit Question Prompt"}</H4>

      {/* Round Duration Picker (only shown when duration picker is enabled) */}
      {showDurationPicker && (
        <YStack space="$3">
          <Text color="$gray11">
            Based on the remaining time and rounds, we suggest {suggestedDuration}{" "}
            minutes, but you can adjust as needed.
          </Text>
          
          <DurationField
            value={duration}
            onChange={(minutes) => setDuration(minutes)}
          />
        </YStack>
      )}

      {/* Question Prompt Editor (always shown) */}
      <YStack space="$2">
        <Text fontWeight="500">Question Prompt</Text>
        <BottomSheetTextInput
          value={promptText}
          onChangeText={setPromptText}
          placeholder="Enter a question for this round..."
          multiline
          numberOfLines={3}
          style={{
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#e0e0e0",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        />
      </YStack>

      {/* Action Buttons */}
      <XStack space="$2" marginTop="$2">
        <Button 
          flex={1} 
          backgroundColor="$blue8" 
          color="white" 
          onPress={handleSavePrompt}
        >
          {isStartingRound ? "Start Round" : "Save"}
        </Button>
        
        <Button flex={1} theme="gray" onPress={onClose}>
          Cancel
        </Button>
      </XStack>
    </YStack>
  );
}
