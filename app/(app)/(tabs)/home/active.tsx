import { Plus } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList } from "react-native";
import { Button, ScrollView, Text, View } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import { BrandGradient } from "../../../../components/UI";
import WalkCard from "../../../../components/WalkCard";
import { useWalks } from "../../../../context/WalksContext";
import { COLORS } from "../../../../styles/colors";

const EmptyMessage = ({ message }: { message: string }) => (
  <Text
    fontSize={16}
    color={COLORS.textOnLight}
    textAlign="center"
    marginTop={10}
    marginBottom={10}
    paddingHorizontal={20}
    backgroundColor="rgba(255, 255, 255, 0.2)"
    padding={15}
    borderRadius={10}
  >
    {message}
  </Text>
);

export default function ActiveTabScreen() {
  const router = useRouter();
  const { upcomingWalks } = useWalks();

  const renderWalkItem = ({ item }: { item: WithId<Walk> }) => (
    <WalkCard key={item.id} walk={item} />
  );

  return (
    <BrandGradient style={{ flex: 1 }}>
      <ScrollView
        flex={1}
        width="100%"
        contentContainerStyle={{
          paddingBottom: 40,
          paddingTop: 10,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {upcomingWalks.length > 0 ? (
          <FlatList
            data={upcomingWalks as unknown as WithId<Walk>[]}
            renderItem={renderWalkItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View height={16} />}
          />
        ) : (
          <EmptyMessage message="There aren't any active walks right now!" />
        )}
      </ScrollView>
      <Button
        position="absolute"
        width={60}
        height={60}
        alignItems="center"
        justifyContent="center"
        right={20}
        bottom={30}
        backgroundColor={COLORS.action}
        borderRadius={30}
        elevation={8}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.3}
        shadowRadius={4}
        onPress={() => router.push("/new-walk")}
        circular
        unstyled
      >
        <Plus size={24} color="white" />
      </Button>
    </BrandGradient>
  );
}
