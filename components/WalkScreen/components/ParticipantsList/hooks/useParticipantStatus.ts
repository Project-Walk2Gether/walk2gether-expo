import { useErrorReporting } from "@/components/ErrorBoundary";
import { firestore_instance } from "@/config/firebase";
import {
  deleteField,
  doc,
  setDoc,
  Timestamp,
} from "@react-native-firebase/firestore";
import { Alert } from "react-native";
import { Participant } from "walk2gether-shared";
import { StatusType } from "../../../utils/walkStatusUtils";

interface UseParticipantStatusOptions {
  walkId: string;
  userId?: string;
  isOwner?: boolean;
  walkStarted?: boolean;
}

/**
 * Custom hook for managing participant status in Firebase
 */
export const useParticipantStatus = ({
  walkId,
  userId,
  isOwner = false,
  walkStarted = false,
}: UseParticipantStatusOptions) => {
  const { reportNonFatalError } = useErrorReporting();

  /**
   * Handle generic Firebase operations with consistent error handling
   */
  const handleFirebaseOperation = async (
    operation: () => Promise<void>,
    errorMessage: string,
    metadata: Record<string, any>
  ) => {
    try {
      await operation();
      return true;
    } catch (error: any) {
      reportNonFatalError(
        error instanceof Error ? error : new Error(errorMessage),
        {
          walkId,
          userId,
          ...metadata,
        },
        errorMessage
      );
      Alert.alert("Error", errorMessage);
      return false;
    }
  };

  /**
   * Update the participant's status and navigation method
   */
  const updateStatus = async (
    newStatus: StatusType,
    currentStatus: StatusType,
    navigationMethod: "walking" | "driving"
  ) => {
    if (!userId || !walkId) return false;
    if (newStatus === currentStatus) return true; // Don't update if status is the same

    return handleFirebaseOperation(
      async () => {
        // Update status in Firestore
        const participantDocRef = doc(
          firestore_instance,
          `walks/${walkId}/participants/${userId}`
        );

        const update: Partial<Participant> = {
          status: newStatus,
          statusUpdatedAt: Timestamp.now(),
          navigationMethod: navigationMethod,
          // Clear cancelledAt if present - this allows cancelled users to rejoin
          cancelledAt: deleteField() as any,
        };

        await setDoc(participantDocRef, update, { merge: true });

        // If user is walk owner and changing from "arrived" to another status,
        // reset the walk's startedAt property
        if (
          isOwner &&
          currentStatus === "arrived" &&
          newStatus !== "arrived" &&
          walkStarted
        ) {
          const walkDocRef = doc(firestore_instance, `walks/${walkId}`);

          await setDoc(
            walkDocRef,
            {
              startedAt: null,
            },
            { merge: true }
          );
        }
      },
      "Failed to update your status. Please try again.",
      { action: "updateStatus", currentStatus, newStatus }
    );
  };

  /**
   * Update only the navigation method
   */
  const updateNavigationMethod = async (
    navigationMethod: "walking" | "driving"
  ) => {
    if (!userId || !walkId) return false;

    return handleFirebaseOperation(
      async () => {
        const participantDocRef = doc(
          firestore_instance,
          `walks/${walkId}/participants/${userId}`
        );

        await setDoc(
          participantDocRef,
          {
            navigationMethod,
          },
          { merge: true }
        );
      },
      "Failed to update navigation method.",
      { action: "updateNavigationMethod", newMethod: navigationMethod }
    );
  };

  /**
   * Cancel participation in the walk
   */
  const cancelParticipation = async () => {
    if (!userId || !walkId) return false;

    return new Promise<boolean>((resolve) => {
      // Show confirmation dialog before proceeding
      Alert.alert(
        "Cancel Participation",
        "Are you sure you can no longer make it to this walk?",
        [
          {
            text: "No, I can still make it",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Yes, I can't make it",
            style: "destructive",
            onPress: async () => {
              const success = await handleFirebaseOperation(
                async () => {
                  // Update the participant doc with cancelledAt
                  const participantDocRef = doc(
                    firestore_instance,
                    `walks/${walkId}/participants/${userId}`
                  );

                  await setDoc(
                    participantDocRef,
                    {
                      cancelledAt: Timestamp.now(),
                    },
                    { merge: true }
                  );

                  // Show confirmation
                  Alert.alert(
                    "Cancelled",
                    "You've let the organizer know you can no longer make it to this walk."
                  );
                },
                "Failed to cancel participation. Please try again.",
                { action: "cancelParticipation" }
              );
              resolve(success);
            },
          },
        ]
      );
    });
  };

  /**
   * Reactivate participation after cancellation
   */
  const reactivateParticipation = async () => {
    if (!userId || !walkId) return false;

    return handleFirebaseOperation(
      async () => {
        // Update the participant doc to remove cancelledAt
        const participantDocRef = doc(
          firestore_instance,
          `walks/${walkId}/participants/${userId}`
        );

        await setDoc(
          participantDocRef,
          {
            cancelledAt: null,
            status: "pending",
          },
          { merge: true }
        );

        // Show confirmation
        Alert.alert(
          "Great!",
          "You're back in! The organizer will be notified you can make it."
        );
      },
      "Failed to update your participation status.",
      { action: "reactivateParticipation" }
    );
  };

  return {
    updateStatus,
    updateNavigationMethod,
    cancelParticipation,
    reactivateParticipation,
  };
};
