import { EmptyMessage } from "@/components/EmptyMessage";
import FAB from "@/components/FAB";
import { Screen } from "@/components/UI";
import WalkCard from "@/components/WalkCard";
import { useNotifications } from "@/context/NotificationsContext";
import { useWalks } from "@/context/WalksContext";
import { syncWalkReminders } from "@/utils/notifications";
import { Footprints } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { FlatList } from "react-native";
import { Text, View } from "tamagui";
import { Walk, WithId, walkIsFriendsWalk } from "walk2gether-shared";

export default function WalksScreen() {
  const router = useRouter();
  const { activeWalks, upcomingWalks } = useWalks();
  const { permissionStatus } = useNotifications();

  // Sync walk reminders whenever upcoming walks change
  useEffect(() => {
    if (permissionStatus?.granted) syncWalkReminders(upcomingWalks);
  }, [upcomingWalks, permissionStatus?.granted]);

  // Custom handler for walk card navigation
  const handleWalkPress = (walk: WithId<Walk>) => {
    if (walkIsFriendsWalk(walk)) {
      // For friends walks, check if participants exist
      const hasParticipants =
        walk.visibleToUserIds && walk.visibleToUserIds.length > 1; // More than just the creator

      if (hasParticipants) {
        // Friends walk with participants - go to show screen
        router.push({ pathname: `/walks/[id]`, params: { id: walk.id } });
      } else {
        // Friends walk with no participants - go to invite screen
        router.push({
          pathname: `/walks/[id]/invite`,
          params: { id: walk.id },
        });
      }
    } else {
      // Not a friends walk (neighborhood walk) - go to walk details
      router.push({ pathname: `/walks/[id]`, params: { id: walk.id } });
    }
  };

  const renderWalkItem = ({ item }: { item: WithId<Walk> }) => (
    <WalkCard
      key={item.id}
      walk={item}
      showActions
      onPress={() => handleWalkPress(item)}
    />
  );

  return (
    <Screen
      title="Walks"
      useTopInsets
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
          message="The Walk2Gether app supports various types of walks"
          subtitle="To explore, please tap the button below. Happy walking!"
          icon={Footprints}
          iconSize={70}
          iconColor="#7C5F45"
        />
      )}
    </Screen>
  );
}
