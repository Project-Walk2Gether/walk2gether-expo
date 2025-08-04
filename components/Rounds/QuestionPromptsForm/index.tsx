import WalkDetailsCard from "@/components/WalkScreen/components/WalkDetailsCard";
import { useSheet } from "@/context/SheetContext";
import { updateDoc } from "@react-native-firebase/firestore";
import { Edit3, HelpCircle, Plus } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";
import { MeetupWalk, WithId } from "walk2gether-shared";
import QuestionPromptSheet from "../QuestionPromptSheet";

interface Props {
  walk: WithId<MeetupWalk>;
}

export default function QuestionPromptsForm({ walk }: Props) {
  const { showSheet, hideSheet } = useSheet();

  // Question prompts handlers
  const handleAddPrompt = () => {
    showSheet(<QuestionPromptSheet walk={walk} onClose={hideSheet} />);
  };

  const handleEditQuestionPrompt = (index: number) => {
    const prompts = walk.questionPrompts || [];
    showSheet(
      <QuestionPromptSheet
        walk={walk}
        onClose={hideSheet}
        editingIndex={index}
        existingPrompt={prompts[index]}
      />
    );
  };

  const handleRemovePrompt = async (index: number) => {
    if (!walk._ref) return;

    try {
      const currentPrompts = walk.questionPrompts || [];
      const updatedPrompts = [...currentPrompts];
      updatedPrompts.splice(index, 1);

      await updateDoc(walk._ref as any, {
        questionPrompts: updatedPrompts,
      });
    } catch (error) {
      console.error("Error removing question prompt:", error);
      Alert.alert("Error", "Failed to remove question prompt");
    }
  };

  const questionPrompts = walk.questionPrompts || [];

  console.log({ questionPrompts });

  return (
    <WalkDetailsCard
      title="Question Prompts"
      headerAction={
        <XStack gap="$2">
          <Button
            mt="$2"
            size="$2"
            theme="gray"
            icon={<HelpCircle size={16} />}
            onPress={() =>
              router.push("/(modals)/question-prompts-help" as any)
            }
          />
          <Button
            mt="$2"
            size="$2"
            theme="blue"
            onPress={handleAddPrompt}
            iconAfter={<Plus size={16} />}
          >
            Add
          </Button>
        </XStack>
      }
    >
      <YStack w="100%" gap="$2">
        {questionPrompts.length > 0 ? (
          questionPrompts.map((prompt, index) => (
            <XStack
              key={index}
              justifyContent="space-between"
              alignItems="flex-start"
              gap="$3"
              pb="$2"
              borderBottomWidth={index < questionPrompts.length - 1 ? 1 : 0}
              borderBottomColor="$gray5"
            >
              <YStack>
                <Text fontSize="$3" fontWeight="500" color="$gray11" mb="$1">
                  Question {index + 1}
                </Text>
                <Text fontSize="$3">{prompt}</Text>
              </YStack>
              <XStack gap="$2">
                <Button
                  size="$2"
                  circular
                  icon={<Edit3 size={16} />}
                  onPress={() => handleEditQuestionPrompt(index)}
                />
                <Button
                  size="$2"
                  circular
                  theme="red"
                  icon={<Text fontSize="$3">×</Text>}
                  onPress={() => handleRemovePrompt(index)}
                />
              </XStack>
            </XStack>
          ))
        ) : (
          <YStack alignItems="center" py="$3">
            <Text color="$gray10" fontSize="$3" textAlign="center">
              Add question prompts to give pairs something to talk about during
              each round.
            </Text>
          </YStack>
        )}
      </YStack>
    </WalkDetailsCard>
  );
}
