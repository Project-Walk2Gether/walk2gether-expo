import { useSharedWalks } from "@/hooks/useSharedWalks";
import React from "react";
import { FlatList } from "react-native";
import { Text, View } from "tamagui";
import { BrandGradient } from "../../../components/UI";
import WalkCard from "../../../components/WalkCard";

export default function HistoryTabScreen() {
  const walks = useSharedWalks();

  return (
    <BrandGradient variant="modern" style={{ flex: 1 }}>
      <FlatList
        data={walks}
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
