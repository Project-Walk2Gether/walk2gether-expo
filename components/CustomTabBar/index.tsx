import WalkIcon from "@/components/WalkIcon";
import { useUpdates } from "@/context/UpdatesContext";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CalendarClock, Footprints, User } from "@tamagui/lucide-icons";
import React, { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack } from "tamagui";
import BottomTabItem from "./BottomTabItem";

const CustomTabBar: React.FC<BottomTabBarProps> = (props) => {
  const insets = useSafeAreaInsets();
  const { isUpdateAvailable } = useUpdates();

  // Function to handle tab press - uses the native React Navigation event system
  // which properly preserves the tab state
  const handleTabPress = useCallback(
    (tabIndex: number) => {
      const event = props.navigation.emit({
        type: "tabPress",
        target: props.state.routes[tabIndex].key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        // The tab press was not prevented, so navigate to this tab
        props.navigation.navigate(props.state.routes[tabIndex].name);
      }
    },
    [props.navigation, props.state]
  );

  return (
    <XStack
      alignItems="center"
      paddingBottom={insets.bottom ? insets.bottom : 10}
      paddingTop={14}
      paddingHorizontal={8}
      borderTopColor="$gray5"
      borderTopWidth={1}
      backgroundColor="$background"
    >
      {/* Walks Tab */}
      <BottomTabItem
        testID="walks-tab"
        isActive={props.state.index === 0}
        IconComponent={Footprints}
        onPress={() => handleTabPress(0)}
        label="Walks"
      />

      {/* Availability Tab */}
      <BottomTabItem
        testID="availability-tab"
        isActive={props.state.index === 1}
        IconComponent={CalendarClock}
        onPress={() => handleTabPress(1)}
        label="Availability"
      />

      {/* Friends Tab */}
      <BottomTabItem
        testID="friends-tab"
        tourRefName="friendsTab"
        isActive={props.state.index === 2}
        IconComponent={(props) => (
          <WalkIcon size={props.size} color={props.color} />
        )}
        onPress={() => handleTabPress(2)}
        label="Friends"
      />

      {/* Me Tab */}
      <BottomTabItem
        testID="me-tab"
        isActive={props.state.index === 3}
        IconComponent={User}
        onPress={() => handleTabPress(3)}
        label="Me"
        badge={isUpdateAvailable ? "!" : undefined}
      />
    </XStack>
  );
};

export default CustomTabBar;
