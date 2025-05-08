import { Leaf } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { Text, View } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import { EmptyMessage } from "../../../../components/EmptyMessage";
import FAB from "../../../../components/FAB";
import { Screen } from "../../../../components/UI";
import WalkCard from "../../../../components/WalkCard";
import { useWalks } from "../../../../context/WalksContext";

export default function WalksScreen() {
  const router = useRouter();
  const { activeWalks, upcomingWalks } = useWalks();
  const renderWalkItem = ({ item }: { item: WithId<Walk> }) => (
    <WalkCard key={item.id} walk={item} />
  );

  return (
    <Screen
      title="Walks"
      gradientVariant="modern"
      floatingAction={
        <FAB text="Start a Walk" onPress={() => router.push("/new-walk")} />
      }
    >
      {activeWalks.length > 0 || upcomingWalks.length > 0 ? (
        <>
          {activeWalks.length > 0 && (
            <>
              <Text fontWeight="bold" fontSize={20} mb="$2">
                Active Walks
              </Text>
              <FlatList
                data={activeWalks}
                renderItem={renderWalkItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View height={16} />}
                contentContainerStyle={{ marginBottom: 24 }}
              />
            </>
          )}
          {upcomingWalks.length > 0 && (
            <>
              <Text fontWeight="bold" fontSize={20} mb="$2" ml="$2">
                Upcoming Walks
              </Text>
              <FlatList
                data={upcomingWalks}
                renderItem={renderWalkItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View height={16} />}
              />
            </>
          )}
        </>
      ) : (
        <EmptyMessage
          message="Looks like it's a quiet moment"
          subtitle="Invite a friend or start a walk to get walking!"
          icon={Leaf}
          iconSize={70}
          iconColor="#7C5F45"
        />
      )}
    </Screen>
  );
}
