import FullScreenLoader from "@/components/FullScreenLoader";
import { useDoc } from "@/utils/firestore";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { Walk } from "walk2gether-shared";
import WalkForm from "../../../../components/WalkForm";
import { db } from "../../../../config/firebase";

export default function EditWalkScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<Walk>(`walks/${id}`);

  const handleSubmit = async (values: Walk) => {
    try {
      if (!walk) return;

      const walkRef = doc(db, "walks", walk.id!);
      await updateDoc(walkRef, values);

      Alert.alert("Success", "Walk updated successfully!");
      router.back();
    } catch (error) {
      console.error("Error updating walk:", error);
      Alert.alert("Error", "Failed to update walk. Please try again.");
    }
  };

  if (!walk) return <FullScreenLoader />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <WalkForm
        initialValues={walk}
        onSubmit={handleSubmit}
        submitButtonText="Update Walk"
        onCancel={() => router.back()}
        googleApiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
