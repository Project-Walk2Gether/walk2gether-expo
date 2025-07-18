import React from "react";
import { ScrollView } from "react-native";
import { Text, View } from "tamagui";
import { useWalk } from "@/context/WalkContext";
import { useWalkParticipants } from "@/hooks/useWaitingParticipants";
import ParticipantsList from "@/components/WalkScreen/components/ParticipantsList";
import { getWalkStatus } from "@/utils/walkUtils";
import { useAuth } from "@/context/AuthContext";

export default function ParticipantsTab() {
  const { walk } = useWalk();
  const { user } = useAuth();
  const walkId = walk?.id || "";
  
  // Get all participants for the walk
  const participants = useWalkParticipants(walkId);
  
  // Determine if the current user is the walk owner
  const isWalkOwner = user?.uid === walk?.createdByUid;
  
  if (!walk) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>Participant information not available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#fff" }} contentContainerStyle={{ padding: 16 }}>
      <ParticipantsList
        walkId={walkId}
        walkStatus={getWalkStatus(walk)}
        participants={participants}
        currentUserId={user?.uid || ""}
        isOwner={isWalkOwner}
        onParticipantPress={(participant) => {
          // Handle participant press for upcoming walks
          console.log("Participant pressed", participant);
        }}
      />
      
      {participants.length === 0 && (
        <View p="$4" alignItems="center">
          <Text color="$gray11">No participants yet</Text>
        </View>
      )}
    </ScrollView>
  );
}
