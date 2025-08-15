import { useWalkForm } from "@/context/WalkFormContext";
import { HelpCircle, Plus } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Button, Card, Input, Text, XStack, YStack } from "tamagui";
import WizardWrapper from "./WizardWrapper";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// Curated pool of "magic questions"; open-ended, meaningful, inclusive
const MAGIC_QUESTIONS: string[] = [
  "What is a path you almost took but didn't?",
  "What topic could you give a 20-minute talk on with zero preparation?",
  "What would constitute a 'perfect' day for you?",
  "Given the choice of anyone in the world, whom would you want as a dinner guest and why?",
  "What are you currently asking yourself, and how are those questions affecting your focus?",
  "What is the most difficult thing you've ever apologized for?",
  "What is one rule you had growing up that, looking back, you now think was unnecessary or funny?",
  "What's a belief you held strongly that you've since changed your mind about?",
  "What's something you're learning right now that's exciting to you?",
  "What's a small decision that ended up having a big impact on your life?",
  "What is a challenge you've overcome that you're proud of?",
  "If you had an extra free hour every day, how would you use it?",
  "What is a question you wish people asked you more often?",
  "What's a hobby or interest you could talk about for hours?",
  "What's a lesson you learned the hard way that you're grateful for?",
  "Who has shaped you the most, and what did they teach you?",
  "What would your younger self be surprised to learn about your life now?",
  "When do you feel most energized and engaged?",
  "What's a book, movie, or podcast that changed how you see the world, and why?",
  "What's something simple that brings you disproportionate joy?",
];

function generateMagicQuestions(topic?: string | null, count = 5): string[] {
  // Light tailoring: prioritize questions related to sharing expertise if a topic exists
  const pool = [...MAGIC_QUESTIONS];
  const suggestions: string[] = [];

  const normalized = (topic || "").toLowerCase();
  if (normalized) {
    const topicHint = `What is one thing about ${normalized} that most people misunderstand, and why?`;
    const topicShare = `What's a story from your experience with ${normalized} that taught you something important?`;
    const topicStarter = `If someone was new to ${normalized}, what's a great question to start a conversation?`;
    suggestions.push(topicHint, topicShare, topicStarter);
  }

  // Fill remaining from pool without duplicates
  while (suggestions.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const [picked] = pool.splice(idx, 1);
    if (!suggestions.includes(picked)) suggestions.push(picked);
  }

  // If tailorings made it exceed count, trim
  return suggestions.slice(0, count);
}

const QuestionPromptsSelection: React.FC<Props> = ({
  onContinue,
  onBack,
  currentStep,
  totalSteps,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const prompts = useMemo<string[]>(() => {
    return (formData as any).questionPrompts || [];
  }, [formData]);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(prompts[index] || "");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const saveEdit = () => {
    if (editingIndex === null) return;
    const next = [...prompts];
    next[editingIndex] = editingText.trim();
    updateFormData({ questionPrompts: next } as any);
    cancelEdit();
  };

  const handleAddPrompt = () => {
    const next = [...prompts, ""];
    updateFormData({ questionPrompts: next } as any);
    // Immediately edit the new prompt
    setEditingIndex(next.length - 1);
    setEditingText("");
  };

  const handleRemovePrompt = (index: number) => {
    const next = [...prompts];
    next.splice(index, 1);
    updateFormData({ questionPrompts: next } as any);
    if (editingIndex === index) cancelEdit();
  };

  const handleGenerate = () => {
    const generated = generateMagicQuestions(formData.topic as string | undefined, 5);
    updateFormData({ questionPrompts: generated } as any);
    cancelEdit();
  };

  return (
    <WizardWrapper
      onContinue={onContinue}
      onBack={onBack}
      currentStep={currentStep}
      totalSteps={totalSteps}
      continueText="Continue"
    >
      <YStack gap="$4" paddingHorizontal={16}>
        <Card backgroundColor="white" borderRadius={12} elevation={2} padding="$4">
          <YStack gap="$3">
            <YStack gap="$2">
              <Text fontSize={24} fontWeight="bold">
                Add question prompts
              </Text>
              <XStack gap="$2" flexWrap="wrap">
                <Button
                  size="$2"
                  theme="gray"
                  icon={<HelpCircle size={16} />}
                  onPress={() => router.push("/(modals)/question-prompts-help" as any)}
                />
                <Button size="$2" theme="blue" onPress={handleGenerate}>
                  Generate magic questions
                </Button>
              </XStack>
            </YStack>

            <Text fontSize={16} color="#555">
              Magic questions are open-ended, thought-provoking prompts designed to spark
              meaningful conversation and connection. You can write your own or generate a
              set to get started.
            </Text>

            <XStack gap="$2">
              <Button size="$2" iconAfter={<Plus size={16} />} onPress={handleAddPrompt}>
                Add prompt
              </Button>
            </XStack>

            <YStack w="100%" gap="$2">
              {prompts.length > 0 ? (
                prompts.map((prompt, index) => {
                  const isEditing = editingIndex === index;
                  return (
                    <YStack
                      key={index}
                      gap="$2"
                      pb="$2"
                      borderBottomWidth={index < prompts.length - 1 ? 1 : 0}
                      borderBottomColor="$gray5"
                    >
                      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
                        <YStack flex={1}>
                          <Text fontSize="$3" fontWeight="500" color="$gray11" mb="$1">
                            Question {index + 1}
                          </Text>
                          {isEditing ? (
                            <Input
                              value={editingText}
                              onChangeText={setEditingText}
                              placeholder="Enter your question..."
                              backgroundColor="#f8f8f8"
                              borderRadius={8}
                            />
                          ) : (
                            <Text fontSize="$3">{prompt}</Text>
                          )}
                        </YStack>
                        <XStack gap="$2">
                          {isEditing ? (
                            <>
                              <Button size="$2" theme="green" onPress={saveEdit}>
                                Save
                              </Button>
                              <Button size="$2" theme="gray" onPress={cancelEdit}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="$2" onPress={() => startEdit(index)}>
                                Edit
                              </Button>
                              <Button size="$2" theme="red" onPress={() => handleRemovePrompt(index)}>
                                Remove
                              </Button>
                            </>
                          )}
                        </XStack>
                      </XStack>
                    </YStack>
                  );
                })
              ) : (
                <YStack alignItems="center" py="$3">
                  <Text color="$gray10" fontSize="$3" textAlign="center">
                    Add question prompts to give pairs something to talk about during each round.
                  </Text>
                </YStack>
              )}
            </YStack>
          </YStack>
        </Card>
      </YStack>
    </WizardWrapper>
  );
};

export default QuestionPromptsSelection;
