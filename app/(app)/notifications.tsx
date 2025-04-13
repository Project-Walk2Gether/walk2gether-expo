import { firestore_instance } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { useQuery } from "@/utils/firestore";
import { collection, orderBy, query } from "@react-native-firebase/firestore";
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Text, View } from "tamagui";
import { Notification } from "walk2gether-shared";

const icon = require("../../assets/notification-icon.png");

export default function NotificationsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { docs: notifications } = useQuery(
    query(
      collection(firestore_instance, "users", user!.uid, "notifications"),
      orderBy("createdAt", "desc")
    )
  );

  const handleNotificationPress = async (notification: Notification) => {
    // Mark notification as read
    if (!notification.read) {
      try {
        const notificationRef = firestore_instance.doc(
          `notifications/${notification.id}`
        );
        await notificationRef.update({
          read: true,
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate based on notification type
    if (
      notification.type === NotificationType.NEW_WALK &&
      notification.data?.walkId
    ) {
      router.push(`/(app)/(modals)/walk/${notification.data.walkId}`);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_WALK:
        return icon;
      case NotificationType.WALK_INVITE:
        return icon;
      case NotificationType.WALK_REMINDER:
        return icon;
      default:
        return icon;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const date = item.createdAt?.toDate
      ? new Date(item.createdAt.toDate())
      : new Date();

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.read && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <Card bordered size="$4" style={styles.notificationCard}>
          <Card.Header padded>
            <View style={styles.notificationHeader}>
              <Image
                source={getNotificationIcon(item.type)}
                style={styles.icon}
              />
              <View style={styles.notificationTitleContainer}>
                <Text fontWeight="bold" fontSize="$4">
                  {item.title}
                </Text>
                <Text color="$gray9" fontSize="$2">
                  {date.toLocaleString()}
                </Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          </Card.Header>
          <Card.Footer padded>
            <Text fontSize="$3">{item.body}</Text>
          </Card.Footer>
        </Card>
      </TouchableOpacity>
    );
  };

  if (notifications.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text fontSize="$5" color="$gray9">
          No notifications yet
        </Text>
        <Text fontSize="$3" color="$gray8" textAlign="center" marginTop="$2">
          We'll notify you when there are new walks in your area or when someone
          invites you to a walk.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: "#fff",
  },
  unreadNotification: {
    opacity: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  icon: {
    width: 32,
    height: 32,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
});
