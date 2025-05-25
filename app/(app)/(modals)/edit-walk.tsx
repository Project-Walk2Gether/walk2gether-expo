import CopyableIdField from "@/components/CopyableIdField";
import FullScreenLoader from "@/components/FullScreenLoader";
import HeaderCloseButton from "@/components/HeaderCloseButton";
import WalkForm from "@/components/WalkForm";
import { db } from "@/config/firebase";
import { GOOGLE_MAPS_API_KEY } from "@/config/maps";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useDoc } from "@/utils/firestore";
import { doc, updateDoc } from "@react-native-firebase/firestore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { ScrollView, Spacer } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

export default function EditWalkScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { doc: walk } = useDoc<WithId<Walk>>(`walks/${id}`);
  const { showMessage } = useFlashMessage();

  const handleSubmit = async (values: WithId<Walk>) => {
    try {
      if (!walk) return;

      const walkRef = doc(db, "walks", walk.id!);
      await updateDoc(walkRef, values);

      showMessage("Walk updated successfully!", "success");
      router.back();
    } catch (error) {
      console.error("Error updating walk:", error);
      Alert.alert("Error", "Failed to update walk. Please try again.");
    }
  };

  if (!walk) return <FullScreenLoader />;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Edit walk",
          headerRight: () => <HeaderCloseButton />,
        }}
      />
      <ScrollView
        flex={1}
        backgroundColor="#f5f5f5"
        p="$4"
        keyboardShouldPersistTaps="handled"
      >
        <WalkForm
          initialValues={walk}
          onSubmit={handleSubmit}
          submitButtonText="Update Walk"
          onCancel={() => router.back()}
          googleApiKey={GOOGLE_MAPS_API_KEY}
        />
        <Spacer flexGrow={1} />
        <CopyableIdField showFullId id={walk.id} label="Walk ID" />
      </ScrollView>
    </>
  );
}
