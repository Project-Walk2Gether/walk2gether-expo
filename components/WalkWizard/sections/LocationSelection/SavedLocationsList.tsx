import React from 'react';
import { FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { COLORS } from '@/styles/colors';
import { Location } from './hooks/useSavedLocations';

interface Props {
  locations: Location[];
  loading: boolean;
  onSelectLocation: (latitude: number, longitude: number) => void;
}

const SavedLocationsList: React.FC<Props> = ({
  locations,
  loading,
  onSelectLocation,
}) => {
  if (!locations || locations.length === 0) return null;

  return (
    <YStack space="$2" marginVertical="$2">
      <Text fontSize={16} fontWeight="500" color={COLORS.text}>
        Saved Locations
      </Text>
      <FlatList
        data={locations}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.latitude && item.longitude) {
                onSelectLocation(item.latitude, item.longitude);
              }
            }}
            style={{
              marginRight: 10,
              opacity: loading ? 0.5 : 1,
            }}
            disabled={loading}
          >
            <XStack
              backgroundColor={COLORS.card}
              paddingHorizontal={12}
              paddingVertical={8}
              borderRadius={8}
              alignItems="center"
              space="$2"
            >
              <Text fontSize={14} fontWeight="500" color={COLORS.text}>
                {item.name || "Saved Location"}
              </Text>
            </XStack>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : null
        }
        style={{ marginVertical: 4 }}
      />
    </YStack>
  );
};

export default SavedLocationsList;
