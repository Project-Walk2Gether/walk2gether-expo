import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { MenuItem, useMenu } from "@/context/MenuContext";
import {
  cancelParticipation,
  restoreParticipation,
} from "@/utils/participantManagement";
import { deleteDoc, doc, getDoc } from "@react-native-firebase/firestore";
import { LogOut, MoreVertical, Trash } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  onOpenMaps?: () => void;
  hasLocation?: boolean;
  afterDelete?: () => void;
  iconColor?: string;
}

export default function WalkMenu({ walk, afterDelete, iconColor }: Props) {
  const router = useRouter();
  const { showMenu } = useMenu();
  const { showMessage } = useFlashMessage();
  const { user } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userHasCancelled, setUserHasCancelled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if the current user is the walk owner
  const isWalkOwner = user?.uid === walk.createdByUid;

  // Check if the user has already cancelled their participation
  useEffect(() => {
    if (!user?.uid || !walk.id || isWalkOwner) {
      setLoading(false);
      return;
    }

    const checkParticipationStatus = async () => {
      try {
        const participantDocRef = doc(
          firestore_instance,
          `walks/${walk.id}/participants/${user.uid}`
        );

        const participantSnapshot = await getDoc(participantDocRef);

        if (participantSnapshot.exists()) {
          const participantData = participantSnapshot.data();
          setUserHasCancelled(participantData?.cancelledAt ? true : false);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking participation status:", error);
        setLoading(false);
      }
    };

    checkParticipationStatus();
  }, [user?.uid, walk.id, isWalkOwner]);

  // Utility function to create a confirmation action
  const createConfirmAction = useCallback((action: () => Promise<void>) => {
    return () => {
      setConfirmDialogOpen(true);
      // Store the action to be executed on confirmation
      setCurrentAction(() => action);
    };
  }, []);

  // State to store the current action to be executed on confirmation
  const [currentAction, setCurrentAction] = useState<() => Promise<void>>(
    () => async () => {}
  );

  // Individual action functions
  const cancelWalk = useCallback(async () => {
    try {
      // Update walk with cancelledAt timestamp instead of deleting
      // Use doc reference directly from firestore to avoid type issues
      const walkDocRef = doc(firestore_instance, `walks/${walk.id}`);
      await deleteDoc(walkDocRef);
      showMessage("Walk has been cancelled", "success");

      // If afterDelete is provided, call it after cancellation
      if (afterDelete) {
        afterDelete();
      }
    } catch (error) {
      console.error("Error cancelling walk:", error);
      showMessage("Failed to cancel the walk", "error");
    }
  }, [walk.id, showMessage, afterDelete]);

  const joinWalk = useCallback(async () => {
    if (!user?.uid || !walk.id) return;

    const success = await restoreParticipation(walk.id, user.uid);

    if (success) {
      setUserHasCancelled(false);
      showMessage("You're now attending this walk", "success");
    } else {
      showMessage("Failed to rejoin the walk", "error");
    }
  }, [walk.id, user?.uid, showMessage]);

  const leaveWalk = useCallback(async () => {
    if (!user?.uid || !walk.id) return;

    await cancelParticipation(walk.id, user.uid);

    setUserHasCancelled(true);
    showMessage(
      `We've let ${walk.organizerName} know you can't make it`,
      "success"
    );
  }, [walk.id, user?.uid, showMessage]);

  // Handle the confirmation action
  const handleConfirmAction = useCallback(async () => {
    await currentAction();
  }, [currentAction]);

  const handleShowMenu = useCallback(() => {
    // Use the MenuItem type from the MenuContext
    const menuItems: MenuItem[] = [];

    if (isWalkOwner) {
      // Add the Cancel Walk option at the end for owners
      menuItems.push({
        label: "Cancel Walk",
        icon: <Trash size="$1" />,
        onPress: createConfirmAction(cancelWalk),
        theme: "red",
      });
    } else if (!loading) {
      // For non-owners, show option based on their current status
      if (userHasCancelled) {
        // Show option to rejoin
        menuItems.push({
          label: "I can make it",
          icon: <LogOut size="$1" />,
          onPress: createConfirmAction(joinWalk),
          theme: "green",
        });
      } else {
        // Show option to cancel
        menuItems.push({
          label: "I can no longer make it",
          icon: <LogOut size="$1" />,
          onPress: createConfirmAction(leaveWalk),
          theme: "red",
        });
      }
    }

    showMenu("Walk Options", menuItems);
  }, [
    walk.id,
    showMenu,
    router,
    createConfirmAction, // replaced onActionPress with createConfirmAction
    isWalkOwner,
    userHasCancelled,
    loading,
  ]);

  return (
    <>
      <Button
        size="$2"
        circular
        chromeless
        onPress={handleShowMenu}
        icon={<MoreVertical size="$1" color={iconColor || "black"} />}
      />

      <ConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={
          isWalkOwner
            ? "Cancel Walk"
            : userHasCancelled
            ? "Rejoin Walk"
            : "Cancel Participation"
        }
        description={
          isWalkOwner
            ? "Are you sure you want to cancel this walk? This action cannot be undone."
            : userHasCancelled
            ? "Would you like to join this walk again?"
            : "Are you sure you can no longer make it to this walk?"
        }
        confirmText={
          isWalkOwner
            ? "Yes, cancel"
            : userHasCancelled
            ? "Yes, I can make it"
            : "I can't make it"
        }
        cancelText="No, keep it"
        onConfirm={handleConfirmAction}
        destructive={isWalkOwner || !userHasCancelled}
      />
    </>
  );
}
