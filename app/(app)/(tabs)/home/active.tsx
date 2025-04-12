import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/styles/colors";
import { Plus } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import Section from "../../../../components/Section";
import WalkCard from "../../../../components/WalkCard";
import { useWalks } from "../../../../context/WalksContext.bak";

export default function ActiveTabScreen() {
  const router = useRouter();
  const { upcomingWalks } = useWalks();
  const { user } = useAuth();

  const { myUpcomingWalks, otherUpcomingWalks } = useMemo(() => {
    const myWalks = upcomingWalks.filter(
      (walk) => walk.createdByUid === user!.uid
    );
    const otherWalks = upcomingWalks.filter(
      (walk) => walk.createdByUid !== user!.uid
    );
    return { myUpcomingWalks: myWalks, otherUpcomingWalks: otherWalks };
  }, [upcomingWalks, user]);

  const renderWalkItem = ({ item }: { item: WithId<Walk> }) => (
    <WalkCard key={item.id} walk={item} />
  );

  const EmptyMessage = ({ message }: { message: string }) => (
    <Text style={styles.emptyWalksMessage}>{message}</Text>
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenContainer}>
        <View style={styles.sectionsContainer}>
          <Section
            title="Join a walk"
            subtitle="Discover upcoming walks in your area"
          >
            {otherUpcomingWalks.length > 0 ? (
              <FlatList
                data={otherUpcomingWalks}
                renderItem={renderWalkItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              />
            ) : (
              <EmptyMessage message="No community walks available. Check back later!" />
            )}
          </Section>

          <Section
            title="Your Walks"
            subtitle="Walks you've created"
            action={
              <Button
                size="$3"
                variant="outlined"
                borderColor={COLORS.action}
                color={COLORS.action}
                icon={<Plus size="$1" color={COLORS.action} />}
                onPress={() => router.push("/new-walk")}
                pressStyle={{ opacity: 0.9, scale: 0.98 }}
              >
                New
              </Button>
            }
          >
            {myUpcomingWalks.length > 0 ? (
              <FlatList
                data={myUpcomingWalks}
                renderItem={renderWalkItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
              />
            ) : (
              <EmptyMessage message="You haven't created any walks yet. Start planning one!" />
            )}
          </Section>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    paddingBottom: 40,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: "white",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  screenContainer: {
    paddingHorizontal: 20,
  },
  newWalkButton: {
    backgroundColor: "#4EB1BA",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newWalkButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  sectionsContainer: {
    width: "100%",
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
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
  },
  emptyWalksMessage: {
    fontSize: 16,
    color: COLORS.textOnLight,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 15,
    borderRadius: 10,
  },
});
