import React from "react";
import { FlatList } from "react-native";
import { ScrollView, Text, View } from "tamagui";
import { Walk, WithId } from "walk2gether-shared";
import { BrandGradient } from "../../../../../components/UI";
import WalkCard from "../../../../../components/WalkCard";
import { useMyPastWalks } from "../../../../../services/walksService";

export default function HistoryTabScreen() {
  const pastWalks = useMyPastWalks();

  return (
    <BrandGradient variant="modern" style={{ flex: 1 }}>
      <ScrollView
        flex={1}
        width="100%"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          paddingTop: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {pastWalks.length === 0 ? (
          <View
            flex={1}
            justifyContent="center"
            alignItems="center"
            padding={20}
          >
            <Text fontSize={16} color="#666" textAlign="center">
              You haven't been on any walks yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pastWalks as unknown as WithId<Walk>[]}
            renderItem={({ item }) => <WalkCard walk={item} />}
            keyExtractor={(item) => item.id || String(Date.now())}
            contentContainerStyle={{
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={false}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </BrandGradient>
  );
}
