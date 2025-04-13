// import { allWalkPartnerUids } from "@/utils/walkUtils";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { ScrollView, Text, View } from "tamagui";
import { Walk } from "walk2gether-shared";

interface Props {
  walk: Walk;
}

// Given a walk that the user has been on, show the partners they were matched with
export default function WalkHistoryScreen({ walk }: Props) {
  // const allPartnerUids = allWalkPartnerUids(walk);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Walk Details",
          headerShadowVisible: false,
          headerBackVisible: true,
          headerBackTitle: "Back",
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <Text style={styles.walkName}>{walk.organizer}</Text>
          <Text style={styles.dateTime}>
            {format(walk.date.toDate(), "EEEE, MMMM d, yyyy")} at{" "}
            {format(walk.date.toDate(), "h:mm a")}
          </Text>

          {walk.location && (
            <Text style={styles.location}>
              <Ionicons
                name="location-outline"
                size={16}
                color={COLORS.textSecondary}
              />{" "}
              {walk.location.name}
            </Text>
          )}

          <Text style={styles.duration}>
            <Ionicons
              name="time-outline"
              size={16}
              color={COLORS.textSecondary}
            />{" "}
            {walk.durationMinutes} minutes
          </Text>

          {walk.numberOfRotations > 1 && (
            <Text style={styles.rotations}>
              <Ionicons
                name="swap-horizontal-outline"
                size={16}
                color={COLORS.textSecondary}
              />{" "}
              {walk.numberOfRotations} rotations
            </Text>
          )}
        </View>

        <View style={styles.partnersContainer}>
          <Text style={styles.sectionTitle}>Your Walking Partners</Text>

          {/* {allPartnerUids.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                You walked solo on this walk.
              </Text>
            </View>
          ) : (
            allPartnerUids.map((pair, index) => (
              <UserAvatar key={index} uid={pair} />
            ))
          )} */}
        </View>
      </ScrollView>
    </>
  );
}

const COLORS = {
  primary: "#4285F4",
  background: "#f8f8f8",
  card: "#ffffff",
  text: "#333333",
  textSecondary: "#666666",
  border: "#e0e0e0",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  walkName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 16,
    marginBottom: 12,
  },
  location: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  rotations: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  partnersContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  pair: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  colorIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  pairNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rotationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  aboutMe: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});
