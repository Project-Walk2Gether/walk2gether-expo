import CopyableIdField from "@/components/CopyableIdField";
import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import WalkForm from "@/components/WalkForm";
import { db } from "@/config/firebase";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { useDoc } from "@/utils/firestore";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { ScrollView } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

export default function EditWalkScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<WithId<Walk>>(`walks/${id}`);

  const handleSubmit = async (values: WithId<Walk>) => {
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
    <>
      <Stack.Screen options={{ headerRight: () => <HeaderCloseButton /> }} />
      <ScrollView
        flex={1}
        backgroundColor="#f5f5f5"
        p="$5"
        keyboardShouldPersistTaps="handled"
      >
        {/* Copyable Walk ID field */}
        <CopyableIdField id={walk.id} label="Walk ID" />

        <WalkForm
          initialValues={walk}
          onSubmit={handleSubmit}
          submitButtonText="Update Walk"
          onCancel={() => router.back()}
          googleApiKey={GOOGLE_MAPS_API_KEY}
        />
      </ScrollView>
    </>
  );
}
