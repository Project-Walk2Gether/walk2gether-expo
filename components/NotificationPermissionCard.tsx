import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNotificationPermissions } from "../hooks/useNotificationPermissions";

export default function NotificationPermissionCard() {
  const { requestPermissions } = useNotificationPermissions();
  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Text style={styles.description}>
          Want to get notified of new walks in your area? Enable notifications.
        </Text>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={requestPermissions}
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
  activatedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4EB1BA",
    marginLeft: 10,
  },
  manageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4EB1BA",
    alignSelf: "flex-start",
  },
  manageButtonText: {
    color: "#4EB1BA",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
});
