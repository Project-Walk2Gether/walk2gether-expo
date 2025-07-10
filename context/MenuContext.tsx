import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { Button, Text, YStack } from "tamagui";
import { useSheet } from "./SheetContext";

// Define the MenuItem type
export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  theme?: "default" | "red" | "green" | "blue";
  children?: ReactNode;
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
  const [menuTitle, setMenuTitle] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { showSheet, hideSheet, isSheetOpen } = useSheet();

  // Function to show the menu
  const showMenu = (title: string, items: MenuItem[]) => {
    setMenuTitle(title);
    setMenuItems(items);
    
    // Use the SheetContext to show the menu content
    showSheet(
      <MenuContent 
        title={title} 
        items={items} 
        onClose={hideSheet} 
      />,
      { title }
    );
  };

  return (
    <MenuContext.Provider value={{ showMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

// MenuContent component to be displayed in the sheet
interface MenuContentProps {
  title: string;
  items: MenuItem[];
  onClose: () => void;
}

const MenuContent: React.FC<MenuContentProps> = ({ title, items, onClose }) => {
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
    <YStack gap="$4" padding="$4" paddingTop="$2">
      {items.map((item, index) => (
        <Button
          key={`menu-item-${index}`}
          size="$4"
          onPress={() => {
            onClose();
            setTimeout(() => item.onPress(), 300); // Small delay to let sheet close
          }}
          icon={item.icon}
          iconAfter={item.children}
          {...getButtonStyles(item.theme)}
        >
          {item.label}
        </Button>
      ))}
    </YStack>
  );
};
