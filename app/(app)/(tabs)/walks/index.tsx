import Clouds from "@/components/Clouds";
import { EmptyMessage } from "@/components/EmptyMessage";
import FAB from "@/components/FAB";
import FilterPill from "@/components/FilterPill";
import Sun from "@/components/Sun";
import { Screen } from "@/components/UI";
import WalkCard from "@/components/WalkCard";
import { useNotifications } from "@/context/NotificationsContext";
import { useWalks } from "@/context/WalksContext";
import { COLORS } from "@/styles/colors";
import { syncWalkReminders } from "@/utils/notifications";
import { WALK_TYPES, WalkTypeKey } from "@/utils/walkType";
import { Footprints } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import { Text, YStack } from "tamagui";
import useDynamicRefs from "use-dynamic-refs";
import { Walk, WithId } from "walk2gether-shared";

export default function WalksScreen() {
  const router = useRouter();
  const { activeWalks, upcomingWalks } = useWalks();
  const { permissionStatus } = useNotifications();
  const [_getRef, setRef] = useDynamicRefs();
  const [selectedType, setSelectedType] = useState<WalkTypeKey | "all">("all");

  // Sync walk reminders whenever upcoming walks change
  useEffect(() => {
    if (permissionStatus?.granted) syncWalkReminders(upcomingWalks);
  }, [upcomingWalks, permissionStatus?.granted]);

  // Filter walks based on selected type
  const filteredActiveWalks =
    selectedType === "all"
      ? activeWalks
      : activeWalks.filter((walk) => walk.type === selectedType);

  const filteredUpcomingWalks =
    selectedType === "all"
      ? upcomingWalks
      : upcomingWalks.filter((walk) => walk.type === selectedType);

  const renderWalkItem = ({ item }: { item: WithId<Walk> }) => {
    // Determine the destination tab based on walk status
    const now = new Date();
    
    // Router pathnames must be literal strings for type safety
    let tab: "connect" | "meet" | "plan" = "plan";
    
    // If walk has started and hasn't ended
    if (item.startedAt && (!item.endTime || now < item.endTime.toDate())) {
      tab = "connect";
    } 
    // If walk is about to start in the next 4 hours
    else if (item.date) {
      const walkDate = item.date.toDate();
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      
      if (walkDate <= fourHoursFromNow) {
        tab = "meet";
      }
    }
    
    return (
      <WalkCard
        key={item.id}
        walk={item}
        showActions
        onPress={() =>
          router.push({
            pathname: `/walks/[id]/${tab}`,
            params: { id: item.id },
          })
        }
      />
    );
  };

  // Handle filter selection
  const handleFilterSelect = useCallback((type: WalkTypeKey | "all") => {
    setSelectedType(type);
  }, []);

  // Render filter pill
  const renderFilterPill = ({
    item,
  }: {
    item: {
      type: WalkTypeKey | "all";
      title: string;
      icon?: string;
      color: string;
      backgroundColor: string;
    };
  }) => (
    <FilterPill
      type={item.type}
      title={item.title}
      icon={item.icon}
      color={item.color}
      backgroundColor={item.backgroundColor}
      isActive={selectedType === item.type}
      onSelect={handleFilterSelect}
    />
  );

  // Prepare filter options
  type FilterOption = {
    type: WalkTypeKey | "all";
    title: string;
    icon?: string;
    color: string;
    backgroundColor: string;
  };

  const filterOptions: FilterOption[] = [
    {
      type: "all",
      title: "All Walks",
      color: COLORS.primary,
      backgroundColor: "#F0F0F0",
    },
    ...Object.values(WALK_TYPES).map((walkType) => ({
      type: walkType.type,
      title: walkType.title,
      icon: walkType.icon,
      color: walkType.color,
      backgroundColor: walkType.backgroundColor,
    })),
  ];

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
            text="Create Walk"
            onPress={() => router.push("/new-walk")}
          />
        }
      >
        <FlatList
          data={filterOptions}
          renderItem={renderFilterPill}
          keyExtractor={(item) => item.type}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 20,
          }}
        />
        <YStack mx={20}>
          {filteredActiveWalks.length > 0 ||
          filteredUpcomingWalks.length > 0 ? (
            <>
              {filteredActiveWalks.length > 0 && (
                <YStack mb="$2">
                  <Text fontWeight="bold" fontSize={20} mb="$2">
                    Active Walks
                  </Text>
                  <FlatList
                    data={filteredActiveWalks}
                    renderItem={renderWalkItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </YStack>
              )}
              {filteredUpcomingWalks.length > 0 && (
                <YStack mb="$2">
                  <Text fontWeight="bold" fontSize={20} mb="$2" ml="$2">
                    Upcoming Walks
                  </Text>
                  <FlatList
                    data={filteredUpcomingWalks}
                    renderItem={renderWalkItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                </YStack>
              )}
            </>
          ) : (
            <EmptyMessage
              message={
                selectedType === "all"
                  ? "Ready to take the first step?"
                  : `No ${selectedType in WALK_TYPES ? WALK_TYPES[selectedType].title : ""} walks found`
              }
              subtitle={
                selectedType === "all"
                  ? `Start a walk with a using the button below! Or go to the Friends tab below to "Invite a Friend".`
                  : `Try creating a new ${
                      (selectedType in WALK_TYPES) ? WALK_TYPES[selectedType].title : ""
                    } walk, or select a different filter`
              }
              icon={Footprints}
              iconSize={70}
              iconColor={
                selectedType === "all"
                  ? COLORS.primary
                  : (selectedType in WALK_TYPES ? WALK_TYPES[selectedType].color : COLORS.primary)
              }
            />
          )}
        </YStack>
      </Screen>
    </>
  );
}
