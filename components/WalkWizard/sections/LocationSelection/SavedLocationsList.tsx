import { COLORS } from "@/styles/colors";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Text, XStack, YStack } from "tamagui";

interface Props {
  locations: any[];
  loading: boolean;
  onSelectLocation: (location: any) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const CARD_SPACING = 16;
const CARD_WIDTH = screenWidth - CARD_SPACING;

const SavedLocationsList: React.FC<Props> = ({
  locations,
  loading,
  onSelectLocation,
}) => {
  if (loading) {
    return (
      <YStack gap="$2" marginVertical="$2">
        <YStack paddingHorizontal={16}>
          <Text fontSize={16} fontWeight="500" color={COLORS.text}>
            Saved Locations
          </Text>
        </YStack>
        <XStack justifyContent="center" paddingVertical="$4">
          <ActivityIndicator size="small" color={COLORS.primary} />
        </XStack>
      </YStack>
    );
  }

  if (!locations || locations.length === 0) return null;

  return (
    <YStack gap="$2" marginVertical="$2">
      <YStack paddingHorizontal={16}>
        <Text fontSize={16} fontWeight="500" color={COLORS.text}>
          Saved Locations
        </Text>
      </YStack>
      <FlatList
        data={locations}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onSelectLocation(item)}
            style={{
              width: CARD_WIDTH,
              marginHorizontal: CARD_SPACING / 2,
            }}
          >
            <YStack
              backgroundColor={COLORS.card}
              borderRadius={12}
              overflow="hidden"
              borderWidth={1}
              borderColor={COLORS.border}
            >
              {/* Small Google Map */}
              <MapView
                style={{
                  width: "100%",
                  height: 120,
                }}
                region={{
                  latitude: item.location.latitude,
                  longitude: item.location.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: item.location.latitude,
                    longitude: item.location.longitude,
                  }}
                />
              </MapView>

              {/* Location info */}
              <YStack padding="$3" gap="$1">
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color={COLORS.text}
                  numberOfLines={1}
                >
                  {item.location.name || "Saved Location"}
                </Text>
                {item.location.notes && (
                  <Text
                    fontSize={14}
                    color={COLORS.textSecondary}
                    numberOfLines={2}
                  >
                    {item.location.notes}
                  </Text>
                )}
              </YStack>
            </YStack>
          </TouchableOpacity>
        )}
      />
    </YStack>
  );
};

export default SavedLocationsList;
