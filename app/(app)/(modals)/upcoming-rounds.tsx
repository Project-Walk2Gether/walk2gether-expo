import { EditPromptSheet } from "@/components/Chat/UpcomingRoundsList/EditPromptSheet";
import { UpcomingRound } from "@/components/Chat/UpcomingRoundsList/UpcomingRound";
import HeaderBackButton from "@/components/HeaderBackButton";
import { useAuth } from "@/context/AuthContext";
import { WalkProvider } from "@/context/WalkContext";
import { useDoc } from "@/utils/firestore";
import BottomSheet from "@gorhom/bottom-sheet";
import firestore from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { ScrollView } from "react-native";
import { Text, YStack } from "tamagui";
import { MeetupWalk, Round } from "walk2gether-shared";

export default function UpcomingRoundsModal() {
  const { walkId } = useLocalSearchParams<{ walkId: string }>();
  const [expandedRoundIndex, setExpandedRoundIndex] = useState<number | null>(
    null
  );
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(
    null
  );
  const [promptText, setPromptText] = useState("");
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Fetch the walk document to get upcoming rounds
  const { doc: walk, status: walkStatus } = useDoc<MeetupWalk>(
    `walks/${walkId}`
  );
  const upcomingRounds = walk?.upcomingRounds || [];
  const loading = walkStatus === "loading";

  // Handle editing a round's question prompt
  const handleEditPrompt = (index: number) => {
    setPromptText(upcomingRounds[index].questionPrompt || "");
    setEditingPromptIndex(index);
    bottomSheetRef.current?.expand();
  };

  // Save the edited question prompt
  const handleSavePrompt = async () => {
    if (editingPromptIndex === null || !walkId) return;

    try {
      // Update the upcomingRounds array in the walk document
      const updatedRounds = [...upcomingRounds];
      updatedRounds[editingPromptIndex] = {
        ...updatedRounds[editingPromptIndex],
        questionPrompt: promptText,
      };

      await firestore().collection("walks").doc(walkId).update({
        upcomingRounds: updatedRounds,
      });

      // Close the bottom sheet
      bottomSheetRef.current?.close();
      setEditingPromptIndex(null);
    } catch (error) {
      console.error("Error saving question prompt:", error);
    }
  };

  const { user } = useAuth();

  return (
    <YStack flex={1}>
      <Stack.Screen
        options={{
          title: "Upcoming Rounds",
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <YStack flex={1} backgroundColor="white" padding="$4">
        {loading ? (
          <Text textAlign="center" padding="$4">
            Loading rounds...
          </Text>
        ) : upcomingRounds.length === 0 ? (
          <Text textAlign="center" padding="$4">
            No upcoming rounds found
          </Text>
        ) : (
          <WalkProvider walk={walk}>
            <ScrollView>
              {upcomingRounds.map((round: Round, index: number) => (
                <UpcomingRound
                  key={`round-${index}`}
                  round={round}
                  index={index}
                  isExpanded={expandedRoundIndex === index}
                  onToggleExpand={() =>
                    setExpandedRoundIndex(
                      expandedRoundIndex === index ? null : index
                    )
                  }
                  onEditPrompt={() => handleEditPrompt(index)}
                />
              ))}
            </ScrollView>
          </WalkProvider>
        )}
      </YStack>
      <EditPromptSheet
        ref={bottomSheetRef}
        promptText={promptText}
        setPromptText={setPromptText}
        onSave={handleSavePrompt}
      />
    </YStack>
  );
}
