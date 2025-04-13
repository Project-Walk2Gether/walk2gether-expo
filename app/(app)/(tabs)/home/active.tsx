import NotificationPermissionCard from "@/components/NotificationPermissionCard";
import { BrandGradient } from "@/components/UI";
import { useAuth } from "@/context/AuthContext";
import { useNotificationPermissions } from "@/hooks/useNotificationPermissions";
import { COLORS } from "@/styles/colors";
import { Plus } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import WalkCard from "../../../../components/WalkCard";
import { useWalks } from "../../../../context/WalksContext.bak";

export default function ActiveTabScreen() {
  const router = useRouter();
  const { upcomingWalks } = useWalks();
  const { user } = useAuth();
  const { permissionStatus, loading: notificationPermissionStatusLoading } =
    useNotificationPermissions();

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
    <BrandGradient style={styles.gradientContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
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
          <EmptyMessage message="There aren't any active walks right now!" />
        )}
        {!notificationPermissionStatusLoading && !permissionStatus?.granted ? (
          <NotificationPermissionCard />
        ) : null}
      </ScrollView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/new-walk")}
        activeOpacity={0.8}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
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
    paddingHorizontal: 20,
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
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 30,
    backgroundColor: COLORS.action,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 30,
    backgroundColor: COLORS.action,
    borderRadius: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
