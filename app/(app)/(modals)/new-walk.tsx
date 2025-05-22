import { WalkWizard } from "@/components/WalkWizard";
import { WalkFormProvider } from "@/context/WalkFormContext";
import { useLocalSearchParams } from "expo-router";

export default function NewWalkScreen() {
  const params = useLocalSearchParams();
  const friendId = params.friendId as string | undefined;

  return (
    <WalkFormProvider friendId={friendId}>
      <WalkWizard />
    </WalkFormProvider>
  );
}
