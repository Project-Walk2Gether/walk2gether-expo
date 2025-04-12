import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNotificationPermissions } from "../hooks/useNotificationPermissions";

interface NotificationPermissionCardProps {
  onPermissionGranted?: () => void;
}

export default function NotificationPermissionCard({
  onPermissionGranted,
}: NotificationPermissionCardProps) {
  const { permissionStatus, requestPermissions, loading } =
    useNotificationPermissions();

  // Call onPermissionGranted when permission status changes to granted
  useEffect(() => {
    if (permissionStatus?.granted && onPermissionGranted) {
      onPermissionGranted();
    }
  }, [permissionStatus, onPermissionGranted]);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.description}>
          Want to get notified of new walks in your area? Enable notifications.
        </Text>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={requestPermissions}
          disabled={loading}
        >
          <Text style={styles.enableButtonText}>Enable Notifications</Text>
        </TouchableOpacity>
        <Text style={styles.turnOff}>You can turn this off at any time.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: "#666",
    marginBottom: 16,
  },
  turnOff: {
    fontSize: 14,
    color: "#999",
    marginTop: 16,
  },
  enableButton: {
    backgroundColor: "#4EB1BA",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  enableButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
