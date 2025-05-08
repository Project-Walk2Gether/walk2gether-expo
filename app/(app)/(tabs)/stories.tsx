import { useSharedWalks } from "@/hooks/useSharedWalks";
import { Book } from "@tamagui/lucide-icons";
import React from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "tamagui";
import { BrandGradient, ScreenTitle } from "../../../components/UI";
import { EmptyMessage } from "../../../components/EmptyMessage";
import WalkCard from "../../../components/WalkCard";

export default function HistoryTabScreen() {
  const walks = useSharedWalks();
  const insets = useSafeAreaInsets();

  return (
    <BrandGradient variant="modern" style={{ flex: 1 }}>
      <View f={1} pt={insets.top}>
        <View px="$4">
          <ScreenTitle>Stories</ScreenTitle>
        </View>
        <ScrollView
          flex={1}
          width="100%"
          contentContainerStyle={{
            paddingBottom: 40,
            paddingTop: 10,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </View>
    </BrandGradient>
  );
}
