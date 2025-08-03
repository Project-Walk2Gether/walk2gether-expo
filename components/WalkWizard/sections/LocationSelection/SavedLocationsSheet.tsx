import { COLORS } from "@/styles/colors";
import React from "react";
import { TouchableOpacity, Alert } from "react-native";
import { Button, Text, XStack, YStack } from "tamagui";
import { MapPin, Trash2, X } from "@tamagui/lucide-icons";
import MapView, { Marker } from "react-native-maps";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

interface Props {
  locations: any[];
  loading: boolean;
  onSelectLocation: (location: any) => void;
  onClose: () => void;
  onDeleteLocation?: (location: any) => void;
}



const SavedLocationsSheet: React.FC<Props> = ({
  locations,
  loading,
  onSelectLocation,
  onClose,
  onDeleteLocation,
}) => {
  const handleSelectLocation = (location: any) => {
    onSelectLocation(location);
    onClose();
  };

  const handleDeleteLocation = (location: any) => {
    Alert.alert(
      "Delete Saved Location",
      `Are you sure you want to delete "${location.location.name || 'this location'}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await location._ref.delete();
              onDeleteLocation?.(location);
            } catch (error) {
              console.error("Error deleting saved location:", error);
              Alert.alert("Error", "Failed to delete saved location. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <YStack flex={1}>
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          paddingHorizontal="$4" 
          paddingTop="$4" 
          paddingBottom="$3"
        >
          <Text fontSize={20} fontWeight="600" color={COLORS.text}>
            Saved Locations
          </Text>
          <Button
            size="$3"
            circular
            icon={X}
            onPress={onClose}
            backgroundColor="transparent"
          />
        </XStack>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text color={COLORS.textSecondary}>Loading saved locations...</Text>
        </YStack>
      </YStack>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <YStack flex={1}>
        {/* Header */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center" 
          paddingHorizontal="$4" 
          paddingTop="$4" 
          paddingBottom="$3"
        >
          <Text fontSize={20} fontWeight="600" color={COLORS.text}>
            Saved Locations
          </Text>
          <Button
            size="$3"
            circular
            icon={X}
            onPress={onClose}
            backgroundColor="transparent"
          />
        </XStack>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$2">
          <MapPin size={48} color={COLORS.textSecondary} />
          <Text color={COLORS.textSecondary} textAlign="center">
            No saved locations yet
          </Text>
          <Text color={COLORS.textMuted} textAlign="center" fontSize="$3">
            Locations you use frequently will appear here
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1}>
      {/* Header */}
      <XStack 
        justifyContent="space-between" 
        alignItems="center" 
        paddingHorizontal="$4" 
        paddingTop="$4" 
        paddingBottom="$3"
      >
        <Text fontSize={20} fontWeight="600" color={COLORS.text}>
          Choose Saved Location
        </Text>
        <Button
          size="$3"
          circular
          icon={X}
          onPress={onClose}
          backgroundColor="transparent"
        />
      </XStack>
      
      {/* Vertical List */}
      <BottomSheetFlatList
        data={locations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <YStack style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => handleSelectLocation(item)}
            >
              <YStack
                backgroundColor={COLORS.card}
                borderRadius={12}
                overflow="hidden"
                borderWidth={1}
                borderColor={COLORS.border}
                shadowColor="$shadowColor"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.1}
                shadowRadius={4}
                elevation={2}
              >
                {/* Header with delete button */}
                <XStack 
                  justifyContent="space-between" 
                  alignItems="center" 
                  padding="$3"
                  paddingBottom="$2"
                >
                  <Text 
                    fontSize={16} 
                    fontWeight="600" 
                    color={COLORS.text}
                    numberOfLines={1}
                    flex={1}
                  >
                    {item.location.name || "Saved Location"}
                  </Text>
                  <Button
                    size="$2"
                    chromeless
                    icon={<Trash2 size={16} />}
                    circular
                    onPress={() => handleDeleteLocation(item)}
                    color="$red10"
                    pressStyle={{
                      backgroundColor: "$red3",
                    }}
                  />
                </XStack>
                
                {/* Large Google Map */}
                <MapView
                  style={{
                    width: '100%',
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
                
                {/* Location info below map */}
                <YStack padding="$3" paddingTop="$2" gap="$1">
                  {item.location.notes && (
                    <Text 
                      fontSize={14} 
                      color={COLORS.textSecondary}
                      numberOfLines={2}
                    >
                      {item.location.notes}
                    </Text>
                  )}
                  <Text 
                    fontSize={12} 
                    color={COLORS.textMuted}
                  >
                    Used {item.useCount} {item.useCount === 1 ? 'time' : 'times'}
                  </Text>
                </YStack>
              </YStack>
            </TouchableOpacity>
          </YStack>
        )}
      />
    </YStack>
  );
};

export default SavedLocationsSheet;
