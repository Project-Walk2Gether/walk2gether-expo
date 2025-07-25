import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, { useState } from "react";
import { Button, H4, Text, XStack, YStack } from "tamagui";
import { Round, WithId } from "walk2gether-shared";
import { DocumentReference, updateDoc } from "firebase/firestore";

interface Props {
  round: WithId<Round>;
  onClose: () => void;
  onSave?: () => void;
}

export default function EditRoundSheet({ 
  round, 
  onClose,
  onSave
}: Props) {
  const [promptText, setPromptText] = useState(round.questionPrompt || "");
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    if (!round._ref) {
      console.error("Round document reference is missing");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update the round document with the new question prompt
      // Cast to unknown first to avoid TypeScript errors with DocumentReferenceLike
      await updateDoc(round._ref as unknown as DocumentReference<Round>, {
        questionPrompt: promptText
      });
      
      // Call onSave if provided
      if (onSave) {
        onSave();
      }
      
      // Close the sheet
      onClose();
    } catch (error) {
      console.error("Error updating round:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <YStack padding="$4" space="$4">
      {/* Title */}
      <H4>Edit Round {round.roundNumber}</H4>

      {/* Question Prompt Editor */}
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
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
        
        <Button flex={1} theme="gray" onPress={onClose}>
          Cancel
        </Button>
      </XStack>
    </YStack>
  );
}
