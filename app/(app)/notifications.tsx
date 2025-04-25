import { collection, orderBy, query } from "@react-native-firebase/firestore";
import { router } from "expo-router";
import React from "react";
import { FlatList, Image, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Text, View, XStack, YStack } from "tamagui";
import { Notification } from "walk2gether-shared";
import { firestore_instance } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../styles/colors";
import { useQuery } from "../../utils/firestore";

// Define NotificationType enum to match what's in shared lib
enum NotificationType {
  NEW_WALK = "NEW_WALK",
  WALK_INVITE = "WALK_INVITE",
  WALK_REMINDER = "WALK_REMINDER",
  WALK_CANCELLED = "WALK_CANCELLED",
  WALK_UPDATED = "WALK_UPDATED",
}

const icon = require("../../assets/notification-icon.png");

export default function NotificationsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  // Get notifications and cast to the appropriate type
  const { docs: notificationsData } = useQuery(
    query(
      collection(firestore_instance, "users", user!.uid, "notifications"),
      orderBy("createdAt", "desc")
    )
  );
  
  // Cast the data to the Notification type
  const notifications = notificationsData as unknown as Notification[];

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
      notification.data && 'walkId' in notification.data
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
        style={{
          marginBottom: 12,
        }}
        onPress={() => handleNotificationPress(item)}
      >
        <Card bordered size="$4" backgroundColor="#fff">
          <Card.Header padded>
            <XStack alignItems="center">
              <Image
                source={getNotificationIcon(item.type)}
                style={{ width: 32, height: 32 }}
              />
              <YStack flex={1} marginLeft={12}>
                <Text fontWeight="bold" fontSize="$4">
                  {item.title}
                </Text>
                <Text color="$gray9" fontSize="$2">
                  {date.toLocaleString()}
                </Text>
              </YStack>
              {!item.read && (
                <View 
                  width={10} 
                  height={10} 
                  borderRadius={5} 
                  backgroundColor={COLORS.primary} 
                  marginLeft={8}
                />
              )}
            </XStack>
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
      <YStack 
        flex={1} 
        backgroundColor="#f8f8f8" 
        justifyContent="center" 
        alignItems="center" 
        padding={24}
      >
        <Text fontSize="$5" color="$gray9">
          No notifications yet
        </Text>
        <Text fontSize="$3" color="$gray8" textAlign="center" marginTop="$2">
          We'll notify you when there are new walks in your area or when someone
          invites you to a walk.
        </Text>
      </YStack>
    );
  }

  return (
    <View 
      flex={1} 
      backgroundColor="#f8f8f8" 
      paddingBottom={insets.bottom}
    >
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}


