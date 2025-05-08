import { firestore_instance } from "@/config/firebase";
import { useFlashMessage } from "@/context/FlashMessageContext";
import { createFriendship, InviterData } from "@/utils/invitation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";

interface UseInvitationFlowProps {
  initialAuthMode?: "phone" | "token" | "invitation";
}

interface UseInvitationFlowResult {
  inviterData: InviterData | null;
  acceptFriendship: boolean;
  setAcceptFriendship: (value: boolean) => void;
  loadingInvitation: boolean;
  creatingFriendship: boolean;
  invitationError: string | null;
  authMode: "phone" | "token" | "invitation";
  setAuthMode: (mode: "phone" | "token" | "invitation") => void;
  handleCreateFriendship: (currentUserUid: string) => Promise<void>;
  getInvitationParams: () => {
    referredByUid?: string;
    acceptFriendship: boolean;
  };
}

export const useInvitationFlow = (
  props?: UseInvitationFlowProps
): UseInvitationFlowResult => {
  const { initialAuthMode = "phone" } = props || {};
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    code?: string;
    referredByUid?: string;
  }>();
  const { showMessage } = useFlashMessage();

  // State management for invitation flow
  const [authMode, setAuthMode] = useState<"phone" | "token" | "invitation">(
    initialAuthMode
  );
  const [inviterData, setInviterData] = useState<InviterData | null>(null);
  const [acceptFriendship, setAcceptFriendship] = useState(true);
  const [loadingInvitation, setLoadingInvitation] = useState(false);
  const [creatingFriendship, setCreatingFriendship] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  // Fetch inviter data by user ID or invitation code
  const fetchInviterData = async (referredByUid?: string, code?: string) => {
    if (!referredByUid && !code) return;

    setLoadingInvitation(true);
    setInvitationError(null);

    try {
      const usersRef = collection(firestore_instance, "users");

      if (referredByUid) {
        // Direct fetch by ID if we have the referrer's ID
        const userDocRef = doc(firestore_instance, "users", referredByUid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists) {
          setInvitationError("Inviter not found");
          setLoadingInvitation(false);
          return;
        }

        const userData = userDoc.data();
        if (userData) {
          setInviterData({
            id: referredByUid,
            name: userData.name || "Unknown",
            profilePicUrl: userData.profilePicUrl,
          });
        }
      } else if (code) {
        // Query by invitation code
        const inviterQuery = query(
          usersRef,
          where("friendInvitationCode", "==", code)
        );
        const querySnapshot = await getDocs(inviterQuery);

        if (querySnapshot.empty) {
          setInvitationError("Invitation code not found");
          setLoadingInvitation(false);
          return;
        }

        // Get the first matching user (should be only one)
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const userId = userDoc.id;

        setInviterData({
          id: userId,
          name: userData.name || "Unknown",
          profilePicUrl: userData.profilePicUrl,
        });

        // Store the referredByUid for later use
        if (userId && !params.referredByUid) {
          router.setParams({ referredByUid: userId });
        }
      }

      setLoadingInvitation(false);
    } catch (error) {
      console.error("Error fetching invitation:", error);
      setInvitationError("Could not load invitation details");
      setLoadingInvitation(false);
    }
  };

  // Handle friendship creation after successful authentication
  const handleCreateFriendship = async (currentUserUid: string) => {
    if (!acceptFriendship || !params.referredByUid || !inviterData) {
      return;
    }

    try {
      setCreatingFriendship(true);
      await createFriendship(currentUserUid, params.referredByUid);
      showMessage(`You are now friends with ${inviterData.name}!`, "success");
    } catch (error) {
      console.error("Error creating friendship:", error);
      showMessage(
        `Could not create friendship: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "error"
      );
    } finally {
      setCreatingFriendship(false);
    }
  };

  // Get invitation parameters for passing to other screens
  const getInvitationParams = () => ({
    referredByUid: params.referredByUid,
    acceptFriendship: acceptFriendship,
  });

  // Check for parameters in URL and set appropriate mode
  useEffect(() => {
    if (params.token) {
      setAuthMode("token");
    } else if (params.code) {
      setAuthMode("invitation");
      fetchInviterData(undefined, params.code);
    } else if (params.referredByUid) {
      // This is the branch that should run when redirected from the join screen
      setAuthMode("invitation");
      fetchInviterData(params.referredByUid);
    }
  }, [params.token, params.code, params.referredByUid]);

  return {
    inviterData,
    acceptFriendship,
    setAcceptFriendship,
    loadingInvitation,
    creatingFriendship,
    invitationError,
    authMode,
    setAuthMode,
    handleCreateFriendship,
    getInvitationParams,
  };
};
