import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Bell } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { collection, onSnapshot, query, where } from "@react-native-firebase/firestore";
import { View, Text } from "tamagui";
import { COLORS } from "@/styles/colors";

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Subscribe to unread notifications count
    const notificationsRef = collection(firestore_instance, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePress = () => {
    router.push("/(app)/notifications");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Bell size={24} color="#000" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text color="white" fontSize={10} fontWeight="bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    marginRight: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
});
