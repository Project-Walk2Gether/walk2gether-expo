import { updateDoc } from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Input, Text, XStack, YStack } from "tamagui";
import { MeetupWalk, WithId } from "walk2gether-shared";

interface Props {
  walk: WithId<MeetupWalk>;
  onClose: () => void;
  editingIndex?: number; // undefined for add mode, number for edit mode
  existingPrompt?: string; // the prompt text when editing
}

export default function QuestionPromptSheet({
  walk,
  onClose,
  editingIndex,
  existingPrompt,
}: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditMode = editingIndex !== undefined;

  // Initialize form with existing prompt when editing
  useEffect(() => {
    setPrompt(existingPrompt || "");
  }, [existingPrompt]);

  const handleSave = async () => {
    if (!prompt.trim() || !walk._ref) return;

    try {
      setLoading(true);

      const currentPrompts = walk.questionPrompts || [];
      let updatedPrompts: string[];

      if (isEditMode && editingIndex !== undefined) {
        // Edit existing prompt
        updatedPrompts = [...currentPrompts];
        updatedPrompts[editingIndex] = prompt.trim();
      } else {
        // Add new prompt
        updatedPrompts = [...currentPrompts, prompt.trim()];
      }

      await updateDoc(walk._ref as any, {
        questionPrompts: updatedPrompts,
      });

      onClose();
    } catch (error) {
      console.error("Error saving question prompt:", error);
      Alert.alert("Error", "Failed to save question prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <YStack padding="$4" gap="$4">
      <Text fontSize="$6" fontWeight="600">
        {isEditMode ? "Edit Question Prompt" : "Add Question Prompt"}
      </Text>

      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="500">
          Question
        </Text>
        <Input
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Enter a question to help break the ice..."
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          size="$4"
        />
        <Text fontSize="$3" color="$gray10">
          This question will be randomly assigned to pairs during rounds.
        </Text>
      </YStack>

      <XStack gap="$3" justifyContent="flex-end">
        <Button
          size="$4"
          variant="outlined"
          onPress={handleClose}
          disabled={loading}
          flex={1}
        >
          Cancel
        </Button>
        <Button
          size="$4"
          theme="blue"
          onPress={handleSave}
          disabled={!prompt.trim() || loading}
          flex={1}
        >
          {loading ? "Saving..." : isEditMode ? "Update" : "Add"}
        </Button>
      </XStack>
    </YStack>
  );
}
