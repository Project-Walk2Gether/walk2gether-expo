import { Leaf, Plus } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { ScrollView, View } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import { EmptyMessage } from "../../../../components/EmptyMessage";
import FAB from "../../../../components/FAB";
import { BrandGradient } from "../../../../components/UI";
import WalkCard from "../../../../components/WalkCard";
import { useWalks } from "../../../../context/WalksContext";

export default function ActiveTabScreen() {
  const router = useRouter();
  const { upcomingWalks } = useWalks();

  const renderWalkItem = ({ item }: { item: WithId<Walk> }) => (
    <WalkCard key={item.id} walk={item} />
  );

  return (
    <BrandGradient variant="modern" style={{ flex: 1 }}>
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
        {upcomingWalks.length > 0 ? (
          <FlatList
            data={upcomingWalks as unknown as WithId<Walk>[]}
            renderItem={renderWalkItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View height={16} />}
          />
        ) : (
          <EmptyMessage
            message="Looks like it's a quiet moment"
            subtitle="Invite a friend or start a walk to get walking!"
            icon={Leaf}
            iconSize={70}
            iconColor="#7C5F45"
          />
        )}
      </ScrollView>
      <FAB
        icon={<Plus size={28} color="white" />}
        accessibilityLabel="Create a new walk"
        onPress={() => router.push("/new-walk")}
      />
    </BrandGradient>
  );
}
