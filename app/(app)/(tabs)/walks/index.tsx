import Clouds from "@/components/Clouds";
import { EmptyMessage } from "@/components/EmptyMessage";
import FAB from "@/components/FAB";
import Sun from "@/components/Sun";
import { Screen } from "@/components/UI";
import WalkCard from "@/components/WalkCard";
import { useNotifications } from "@/context/NotificationsContext";
import { useWalks } from "@/context/WalksContext";
import { COLORS } from "@/styles/colors";
import { syncWalkReminders } from "@/utils/notifications";
import { Footprints } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { FlatList, View } from "react-native";
import { Text } from "tamagui";
import useDynamicRefs from "use-dynamic-refs";
import { Walk, WithId } from "walk2gether-shared";

export default function WalksScreen() {
  const router = useRouter();
  const { activeWalks, upcomingWalks } = useWalks();
  const { permissionStatus } = useNotifications();
  const [_getRef, setRef] = useDynamicRefs();

  // Sync walk reminders whenever upcoming walks change
  useEffect(() => {
    if (permissionStatus?.granted) syncWalkReminders(upcomingWalks);
  }, [upcomingWalks, permissionStatus?.granted]);

  const renderWalkItem = ({ item }: { item: WithId<Walk> }) => (
    <WalkCard
      key={item.id}
      walk={item}
      showActions
      onPress={() =>
        router.push({
          pathname: `/walks/[id]/details`,
          params: { id: item.id },
        })
      }
    />
  );

  return (
    <>
      <StatusBar style="dark" />
      <Screen
        title="Walks"
        useTopInsets
        gradientVariant="outdoor"
        renderAbsolute={
          <View>
            <Sun
              style={{ position: "absolute", top: 20, right: -10, bottom: 20 }}
            />
            <Clouds
              style={{
                position: "absolute",
                top: -80,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </View>
        }
        floatingAction={
          <FAB
            ref={setRef("startWalkFab") as any}
            text="Start a Walk"
            onPress={() => router.push("/new-walk")}
          />
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
                />
              </>
            )}
          </>
        ) : (
          <EmptyMessage
            message="Ready to take the first step?"
            subtitle={`Start a walk with a friend or neighbor using the button below! Or go to the Friends tab below to "Invite a Friend".`}
            icon={Footprints}
            iconSize={70}
            iconColor={COLORS.primary}
          />
        )}
      </Screen>
    </>
  );
}
