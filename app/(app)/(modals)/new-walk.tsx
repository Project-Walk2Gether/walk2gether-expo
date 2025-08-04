import { WalkWizard } from "@/components/WalkWizard";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { useUserData } from "@/context/UserDataContext";
import { WalkFormProvider } from "@/context/WalkFormContext";
import { useQuoteOfTheDay } from "@/utils/quotes";
import { updateExistingWalk } from "@/utils/updateWalk";
import { createWalkFromForm } from "@/utils/walkSubmission";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";

export default function NewWalkScreen() {
  const params = useLocalSearchParams();
  const friendId = params.friendId as string | undefined;
  const router = useRouter();
  const { user } = useAuth();
  const { userData } = useUserData();
  const { showMessage } = useFlashMessage();
  const { advanceToNextQuote } = useQuoteOfTheDay();

  const handleSubmit = useCallback(
    async (
      formData: any,
      createdWalkId: string | null,
      setCreatedWalkId: (id: string) => void,
      goToNextStep: () => void
    ) => {
      console.log("SUBMITTING");
      if (!userData) {
        showMessage("User data not found", "error");
        return;
      }

      // If we already have a created walk ID, update the existing walk instead of creating a new one
      if (createdWalkId) {
        console.log(
          `Updating existing walk ${createdWalkId} instead of creating a new one`
        );
        const success = await updateExistingWalk({
          walkId: createdWalkId,
          formData,
          userData,
        });

        if (!success) {
          showMessage("Failed to update walk", "error");
          return;
        }

        // For friend walks, advance to invite step
        if (formData.type === "friends") {
          goToNextStep();
        } else {
          // For other walk types, close the wizard (navigate away)
          router.back();
        }
        return;
      }

      // Create a new walk if we don't have an ID yet
      const walkDoc = await createWalkFromForm({
        formData,
        userData,
      });

      if (!walkDoc) return;

      // Store the created walk ID to prevent duplicate creation
      setCreatedWalkId(walkDoc.id);

      // Advance to the next quote when a walk is successfully created
      advanceToNextQuote();

      // Always call goToNextStep which will handle navigation appropriately
      // For friend walks, it will go to the invite step
      // For other walk types, if it's the last step, it will close the wizard
      goToNextStep();
    },
    [userData, user, advanceToNextQuote, router, showMessage]
  );

  return (
    <WalkFormProvider friendId={friendId} onSubmit={handleSubmit}>
      <WalkWizard />
    </WalkFormProvider>
  );
}
