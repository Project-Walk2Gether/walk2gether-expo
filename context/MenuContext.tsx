import { MoreVertical } from "@tamagui/lucide-icons";
import React, { createContext, useContext, useState } from "react";
import { Button, Sheet, Text, YStack } from "tamagui";

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

  return (
    <MenuContext.Provider value={{ showMenu }}>
      {children}

      {/* The Sheet component that displays the menu */}
      <Sheet
        modal
        open={isOpen}
        onOpenChange={setIsOpen}
        snapPoints={[45]}
        position={0}
        dismissOnSnapToBottom
        animation="quick"
      >
        <Sheet.Overlay
          animation="lazy"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Sheet.Frame padding="$4" gap="$4">
          <Sheet.Handle />
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
        </Sheet.Frame>
      </Sheet>
    </MenuContext.Provider>
  );
};
