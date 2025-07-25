import React, { useState } from "react";
import { YStack, Text, Button, Input, XStack, Stack, ScrollView } from "tamagui";
import { View, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WalkDetailsCard from "../WalkDetailsCard";
import { updateDoc } from "@react-native-firebase/firestore";
import { MeetupWalk } from "walk2gether-shared";

interface Props {
  walk: MeetupWalk & { _ref?: any };
  isWalkOwner: boolean;
}

export default function QuestionPromptsList({ walk, isWalkOwner }: Props) {
  const [prompts, setPrompts] = useState<string[]>(walk.questionPrompts || []);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");

  const handleAddPrompt = () => {
    if (!newPrompt.trim()) return;
    
    setPrompts([...prompts, newPrompt.trim()]);
    setNewPrompt("");
  };

  const handleRemovePrompt = (index: number) => {
    const updatedPrompts = [...prompts];
    updatedPrompts.splice(index, 1);
    setPrompts(updatedPrompts);
  };

  const handleSavePrompts = async () => {
    if (!walk._ref) return;
    
    try {
      setLoading(true);
      await updateDoc(walk._ref, {
        questionPrompts: prompts
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating question prompts:", error);
      Alert.alert("Error", "Failed to update question prompts");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original prompts
    setPrompts(walk.questionPrompts || []);
    setEditing(false);
    setNewPrompt("");
  };

  if (!walk.questionPrompts && !isWalkOwner) {
    return null; // Don't show anything if there are no prompts and user is not owner
  }

  return (
    <WalkDetailsCard 
      title="Question Prompts" 
      headerAction={
        isWalkOwner && (
          <Button
            size="$2"
            variant="outlined"
            onPress={() => setEditing(!editing)}
            disabled={loading}
          >
            {editing ? "Cancel" : "Edit"}
          </Button>
        )
      }
    >
      <YStack w="100%" gap="$3">
        {editing ? (
          // Edit mode
          <YStack gap="$3" w="100%">
            <ScrollView style={{ maxHeight: 300 }}>
              {prompts.map((prompt, index) => (
                <XStack key={index} gap="$2" mb="$2" alignItems="center">
                  <Text flex={1} numberOfLines={2}>
                    {prompt}
                  </Text>
                  <Button 
                    size="$2" 
                    circular 
                    icon={<Ionicons name="trash-outline" size={16} color="#ff3b30" />}
                    onPress={() => handleRemovePrompt(index)}
                  />
                </XStack>
              ))}
            </ScrollView>
            
            <XStack gap="$2" alignItems="center">
              <Input
                flex={1}
                value={newPrompt}
                onChangeText={setNewPrompt}
                placeholder="Add a new question prompt"
              />
              <Button
                size="$2"
                onPress={handleAddPrompt}
                disabled={!newPrompt.trim()}
              >
                Add
              </Button>
            </XStack>
            
            <XStack gap="$2" justifyContent="flex-end" mt="$2">
              <Button
                size="$3"
                variant="outlined"
                onPress={handleCancelEdit}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="$3"
                theme="green"
                onPress={handleSavePrompts}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </XStack>
          </YStack>
        ) : (
          // View mode
          <YStack>
            {prompts.length > 0 ? (
              prompts.map((prompt, index) => (
                <YStack key={index} mb="$3" pb="$2" borderBottomWidth={index < prompts.length - 1 ? 1 : 0} borderBottomColor="$gray5">
                  <XStack mb="$1">
                    <Text fontWeight="bold">Question {index + 1}</Text>
                  </XStack>
                  <Text>{prompt}</Text>
                </YStack>
              ))
            ) : (
              <Text color="$gray10">No question prompts have been added yet.</Text>
            )}
            
            {isWalkOwner && !prompts.length && (
              <Button
                mt="$3"
                onPress={() => setEditing(true)}
                variant="outlined"
              >
                Add Question Prompts
              </Button>
            )}
          </YStack>
        )}
      </YStack>
    </WalkDetailsCard>
  );
}
