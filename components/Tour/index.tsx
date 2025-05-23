import { db } from "@/config/firebase";
import { useUserData } from "@/context/UserDataContext";
import { serverTimestamp } from "@react-native-firebase/firestore";
import React, { useCallback, useState } from "react";
import { FeatureHighlight } from "react-native-ui-lib";
import useDynamicRefs from "use-dynamic-refs";

interface Props {
  isVisible: boolean;
  onDismiss: () => void;
}

/**
 * Tour component that guides new users through the app
 * Shows feature highlights for key UI elements
 */
const Tour: React.FC<Props> = ({ isVisible, onDismiss }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [getRef] = useDynamicRefs();
  const { userData } = useUserData();

  // Tour steps configuration
  const steps = [
    {
      id: "startWalk",
      title: "Walk2Gether supports various types of walks",
      message: "To explore, please tap the button below.",
      elementRefName: "startWalkFab",
    },
    {
      id: "inviteFriends",
      title: "Connect with Friends",
      message: "Invite your friends and walk 2gether!",
      elementRefName: "friendsTab",
    },
  ];

  // Handle step completion
  const onStepDone = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last step completed, dismiss tour
      onDismiss();

      // Update user data to mark tour as dismissed
      if (userData?.id) {
        db.collection("users")
          .doc(userData.id)
          .update({
            tourDismissedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          .catch((error: Error) => {
            console.error("Error updating tour dismissed status:", error);
          });
      }
    }
  }, [currentStep, steps.length, onDismiss, userData?.id]);

  // Skip if not visible
  if (!isVisible) return null;

  const currentTourStep = steps[currentStep];

  // Create a function to get the current target element
  const getTarget = () => getRef(currentTourStep.elementRefName)?.current;

  const target = getTarget();
  console.log({ target, elementRefName: currentTourStep.elementRefName });

  return (
    <FeatureHighlight
      visible={isVisible}
      title={currentTourStep.title}
      message={currentTourStep.message}
      confirmButtonProps={{
        label: currentStep === steps.length - 1 ? "Let's go!" : "Next",
        onPress: onStepDone,
      }}
      getTarget={getTarget}
      overlayColor={"rgba(0, 0, 0, 0.8)"}
      titleStyle={{
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#fff",
      }}
      innerPadding={4}
      borderRadius={3}
      messageStyle={{
        fontSize: 16,
        lineHeight: 24,
        color: "#fff",
      }}
    />
  );
};

export default Tour;
