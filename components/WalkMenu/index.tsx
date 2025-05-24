import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { MenuItem, useMenu } from "@/context/MenuContext";
import { COLORS } from "@/styles/colors";
import {
  cancelParticipation,
  restoreParticipation,
} from "@/utils/participantManagement";
import { doc, getDoc } from "@react-native-firebase/firestore";
import {
  Edit3,
  LogOut,
  MoreVertical,
  Trash,
  UserPlus,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";

interface Props {
  walk: WithId<Walk>;
  onOpenMaps?: () => void;
  hasLocation?: boolean;
  hideInviteOption?: boolean;
  afterDelete?: () => void;
}

export default function WalkMenu({
  walk,
  hideInviteOption = false,
  afterDelete,
}: Props) {
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

  const onActionPress = useCallback(() => {
    // Open the confirmation dialog
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (isWalkOwner) {
      // Owner cancels the entire walk
      await walk._ref.delete();
      showMessage("Walk has been cancelled", "success");
    } else {
      // Participant action depends on their current status
      if (user?.uid && walk.id) {
        if (userHasCancelled) {
          // User wants to rejoin the walk
          const success = await restoreParticipation(walk.id, user.uid);

          if (success) {
            setUserHasCancelled(false);
            showMessage("You're now attending this walk", "success");
          } else {
            showMessage("Failed to rejoin the walk", "error");
          }
        } else {
          // User wants to cancel participation
          const success = await cancelParticipation(walk.id, user.uid);

          if (success) {
            setUserHasCancelled(true);
            showMessage("You're no longer attending this walk", "success");
          } else {
            showMessage("Failed to cancel your participation", "error");
          }
        }
      }
    }

    // If afterDelete is provided, call it after deletion/update
    if (afterDelete && isWalkOwner) {
      afterDelete();
    }
  }, [
    walk._ref,
    walk.id,
    afterDelete,
    showMessage,
    isWalkOwner,
    user?.uid,
    userHasCancelled,
  ]);

  const handleShowMenu = useCallback(() => {
    // Use the MenuItem type from the MenuContext
    const menuItems: MenuItem[] = [];

    if (isWalkOwner) {
      // Options for walk owner
      menuItems.push({
        label: "Edit Walk",
        icon: <Edit3 size="$1" color={COLORS.primary} />,
        onPress: () => router.push(`/walks/${walk.id}/edit`),
      });

      // Only add the Invite Friends option if not hidden
      if (!hideInviteOption) {
        menuItems.push({
          label: "Invite Friends",
          icon: <UserPlus size="$1" color={COLORS.primary} />,
          onPress: () => router.push(`/walks/${walk.id}/invite`),
        });
      }

      // Add the Cancel Walk option at the end for owners
      menuItems.push({
        label: "Cancel Walk",
        icon: <Trash size="$1" />,
        onPress: onActionPress,
        theme: "red",
      });
    } else if (!loading) {
      // For non-owners, show option based on their current status
      if (userHasCancelled) {
        // Show option to rejoin
        menuItems.push({
          label: "I can make it",
          icon: <LogOut size="$1" />,
          onPress: onActionPress,
          theme: "green",
        });
      } else {
        // Show option to cancel
        menuItems.push({
          label: "I can no longer make it",
          icon: <LogOut size="$1" />,
          onPress: onActionPress,
          theme: "red",
        });
      }
    }

    showMenu("Walk Options", menuItems);
  }, [
    walk.id,
    showMenu,
    router,
    onActionPress,
    hideInviteOption,
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
        icon={<MoreVertical size="$1" color="black" />}
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
