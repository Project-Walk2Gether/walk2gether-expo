import ActiveWalkScreen from "@/components/Walk/ActiveWalkScreen";
import CheckInScreen from "@/components/Walk/CheckInScreen";
import FutureWalkScreen from "@/components/Walk/FutureWalkScreen";
import WalkHistoryScreen from "@/components/Walk/WalkHistoryScreen";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useDoc } from "@/utils/firestore";
import { isActive, isFuture } from "@/utils/walkUtils";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Walk } from "walk2gether-shared";

export default function WalkDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);
  const [isParticipant, setIsParticipant] = useState<boolean | null>(null);
  
  // Check if the user is a participant in this walk
  useEffect(() => {
    if (!walk || !user || !isActive(walk)) {
      // Skip check if walk is not active
      setIsParticipant(null);
      return;
    }
    
    const checkParticipantStatus = async () => {
      try {
        // Check if there's a participant document for this user
        const participantRef = firestore_instance.doc(`walks/${id}/participants/${user.uid}`);
        const participantDoc = await participantRef.get();
        
        setIsParticipant(participantDoc.exists);
      } catch (error) {
        console.error("Error checking participant status:", error);
        setIsParticipant(false);
      }
    };
    
    checkParticipantStatus();
  }, [id, user, walk]);

  if (!walk) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // For past walks, show history
  if (!isActive(walk) && !isFuture(walk)) {
    return <WalkHistoryScreen walk={walk} />;
  }
  
  // For future walks, show future walk screen
  if (isFuture(walk)) {
    return <FutureWalkScreen walk={walk} />;
  }
  
  // For active walks, check participant status
  if (isActive(walk)) {
    // If still checking participation status
    if (isParticipant === null) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Checking your status...</Text>
        </View>
      );
    }
    
    // If user is a participant, show active walk screen
    if (isParticipant) {
      return <ActiveWalkScreen />;
    }
    
    // If user needs to check in
    return (
      <CheckInScreen 
        walk={walk} 
        onCheckInSuccess={() => setIsParticipant(true)} 
      />
    );
  }
  
  // Fallback for any edge cases
  return (
    <View style={styles.centerContainer}>
      <Text>Walk not found, or you were not part of this walk.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  }
});
