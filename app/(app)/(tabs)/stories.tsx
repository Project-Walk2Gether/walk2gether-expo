import { useSharedWalks } from "hooks/useSharedWalks"";
import { Book } from "@tamagui/lucide-icons";
import React from "react";
import { FlatList } from "react-native";
import { View } from "tamagui";
import { Screen } from "../../../components/UI";
import { EmptyMessage } from "../../../components/EmptyMessage";
import WalkCard from "../../../components/WalkCard";

export default function HistoryTabScreen() {
  const walks = useSharedWalks();

  return (
    <Screen title="Stories" gradientVariant="modern">
          {walks.length > 0 ? (
            <FlatList
              data={walks}
              renderItem={({ item }) => (
                <WalkCard walk={item} showAttachments={true} />
              )}
              keyExtractor={(item) => item.id || String(Date.now())}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View height={16} />}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyMessage
              message="No shared walks yet"
              subtitle="When you join walks with friends, they'll appear here as stories."
              icon={Book}
              iconSize={70}
              iconColor="#3E7CB9"
            />
          )}
    </Screen>
  );
}
