import { db } from "config/firebase"";
import { useAuth } from "context/AuthContext"";
import { useQuery } from "utils/firestore"";
import { collection, query, where } from "@react-native-firebase/firestore";
import { sortBy } from "lodash";
import { useMemo } from "react";
import { Walk } from "walk2gether-shared";

export function useSharedWalks() {
  const { user } = useAuth();

  const publicWalksQuery = query(
    collection(db, "walks"),
    where("isSharedWithPublic", "==", true)
  );
  const privateWalksQuery = query(
    collection(db, "walks"),
    where("sharedWithUserUids", "array-contains", user!.uid)
  );

  const { docs: publicWalks } = useQuery<Walk>(publicWalksQuery);
  const { docs: friendsWalks } = useQuery<Walk>(privateWalksQuery);

  const allWalks = useMemo(
    () => sortBy([...publicWalks, ...friendsWalks], (doc) => doc.date.toDate()),
    [publicWalks, friendsWalks]
  );

  return allWalks;
}
