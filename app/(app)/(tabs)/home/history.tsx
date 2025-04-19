import { useRouter } from "expo-router";
import React from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { Walk, WithId } from "walk2gether-shared";
import { BrandGradient } from "../../../../components/UI";
import WalkCardTest from "../../../../components/WalkCardTest";
import { useMyPastWalks } from "../../../../services/walksService";

export default function HistoryTabScreen() {
  const router = useRouter();
  const pastWalks = useMyPastWalks();

  const navigateToWalkDetails = (walk: WithId<Walk>) => {
    router.push(`/walk-details/${walk.id}`);
  };

  return (
    <BrandGradient style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {pastWalks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You haven't been on any walks yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pastWalks}
            renderItem={({ item }) => <WalkCardTest walk={item} />}
            keyExtractor={(item) => item.id || String(Date.now())}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={false}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
