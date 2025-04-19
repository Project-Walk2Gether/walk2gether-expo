import { collection, query, where } from "@react-native-firebase/firestore";
import { Participant } from "walk2gether-shared";
import { firestore_instance } from "../config/firebase";
import { useQuery } from "../utils/firestore";

export function useWaitingParticipants(walkId: string) {
  const waitingParticipantsQuery = query(
    collection(firestore_instance, `walks/${walkId}/participants`),
    where("approvedAt", "==", null)
  );
  const { docs: waitingParticipants } = useQuery<Participant>(
    waitingParticipantsQuery
  );

  return waitingParticipants;
}

export function useWalkParticipants(walkId: string) {
  const waitingParticipantsQuery = query(
    collection(firestore_instance, `walks/${walkId}/participants`)
  );
  const { docs: waitingParticipants } = useQuery<Participant>(
    waitingParticipantsQuery
  );

  return waitingParticipants;
}
