import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { StyleSheet } from "react-native";
import { Button, Text, YStack } from "tamagui";

// Define the MenuItem type
export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  theme?: "default" | "red" | "green" | "blue";
}

// Define the MenuContext type
interface MenuContextType {
  showMenu: (title: string, items: MenuItem[]) => void;
}

// Create the context with a default value
const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Custom hook to use the menu context
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};

// Menu provider component
export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuTitle, setMenuTitle] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Function to show the menu
  const showMenu = (title: string, items: MenuItem[]) => {
    setMenuTitle(title);
    setMenuItems(items);
    setIsOpen(true);
  };

  // Get button theme styles
  const getButtonStyles = (theme: MenuItem["theme"]) => {
    switch (theme) {
      case "red":
        return { backgroundColor: "$red10", color: "white" };
      case "green":
        return { backgroundColor: "$green10", color: "white" };
      case "blue":
        return { backgroundColor: "$blue10", color: "white" };
      default:
        return {}; // Default button styles
    }
  };

  // Create refs for the bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Callbacks for sheet actions
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setIsOpen(false);
    }
  }, []);

  // Backdrop component for the bottom sheet
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Effect to handle opening and closing the sheet
  React.useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  return (
    <MenuContext.Provider value={{ showMenu }}>
      {children}

      {/* The BottomSheet component that displays the menu */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
          <Text fontSize="$6" fontWeight="600" textAlign="center">
            {menuTitle}
          </Text>

          <YStack gap="$4" padding="$2" marginTop="$2">
            {menuItems.map((item, index) => (
              <Button
                key={`menu-item-${index}`}
                size="$4"
                onPress={() => {
                  setIsOpen(false);
                  setTimeout(() => item.onPress(), 300); // Small delay to let sheet close
                }}
                icon={item.icon}
                {...getButtonStyles(item.theme)}
              >
                {item.label}
              </Button>
            ))}
          </YStack>
        </BottomSheetScrollView>
      </BottomSheet>
    </MenuContext.Provider>
  );
};

// Styles for the bottom sheet
const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: "white",
  },
  indicator: {
    backgroundColor: "#CDCDCD",
    width: 40,
    height: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
});
