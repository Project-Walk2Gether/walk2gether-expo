import { db } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@/utils/firestore";
import { collection, query, where } from "@react-native-firebase/firestore";
import { sortBy } from "lodash";
import React, { useMemo } from "react";
import { FlatList } from "react-native";
import { Text, View } from "tamagui";
import { Walk } from "walk2gether-shared";
import { BrandGradient } from "../../../components/UI";
import WalkCard from "../../../components/WalkCard";

export default function HistoryTabScreen() {
  // Get all public walks, or walks from my friends. We do this with two queries and then unify the
  // results
  const { user } = useAuth();

  const publicWalksQuery = query(
    collection(db, "walks"),
    where("isSharedWithFriends", "==", true)
  );
  const walksFromMyFriendsQuery = query(
    collection(db, "walks"),
    where("sharedWithFriendIds", "array-contains", user!.uid)
  );

  const { docs: publicWalks } = useQuery<Walk>(publicWalksQuery);
  const { docs: friendsWalks } = useQuery<Walk>(walksFromMyFriendsQuery);

  const allWalks = useMemo(
    () => sortBy([...publicWalks, ...friendsWalks], (doc) => doc.date.toDate()),
    [publicWalks, friendsWalks]
  );

  return (
    <BrandGradient variant="modern" style={{ flex: 1 }}>
      <FlatList
        data={allWalks}
        renderItem={({ item }) => <WalkCard walk={item} />}
        keyExtractor={(item) => item.id || String(Date.now())}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding={20}
          >
            <Text fontSize={16} color="#666" textAlign="center">
              You haven't been on any walks yet.
            </Text>
          </View>
        )}
      />
    </BrandGradient>
  );
}
