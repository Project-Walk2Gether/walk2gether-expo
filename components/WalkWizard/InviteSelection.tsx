import { COLORS } from "@/styles/colors";
import { MapPin, MessageCircle, Search, UserPlus } from "@tamagui/lucide-icons";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { Button, Card, Input, Text, View, XStack, YStack } from "tamagui";
import FriendsList from "../../components/FriendsList/FriendsList";
import { useWalkForm } from "../../context/WalkFormContext";
import { BrandGradient } from "../UI";

interface InviteSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

export const InviteSelection: React.FC<InviteSelectionProps> = ({
  onContinue,
  onBack,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const [selectedFriends, setSelectedFriends] = useState<string[]>(
    formData.invitees || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const mapRef = useRef<MapView>(null);

  const isNeighborhoodWalk = formData.walkType === "neighborhood";
  const isFriendsWalk = formData.walkType === "friends";

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        const updated = prev.filter((id) => id !== friendId);
        updateFormData({ invitees: updated });
        return updated;
      } else {
        const updated = [...prev, friendId];
        updateFormData({ invitees: updated });
        return updated;
      }
    });
  };

  const addPhoneNumber = () => {
    if (phoneNumber.trim() && !phoneNumbers.includes(phoneNumber.trim())) {
      const updatedNumbers = [...phoneNumbers, phoneNumber.trim()];
      setPhoneNumbers(updatedNumbers);
      setPhoneNumber("");

      // Store phone numbers in invitees for tracking
      const updatedInvitees = [...selectedFriends, ...updatedNumbers];
      updateFormData({ invitees: updatedInvitees });
    }
  };

  const removePhoneNumber = (numberToRemove: string) => {
    const updatedNumbers = phoneNumbers.filter((num) => num !== numberToRemove);
    setPhoneNumbers(updatedNumbers);

    // Remove from invitees as well
    const updatedInvitees = selectedFriends.filter(
      (id) => id !== numberToRemove
    );
    updateFormData({ invitees: updatedInvitees });
  };

  const handleContinue = () => {
    // For neighborhood walks, always allow continuing
    // For friend walks, ensure at least one friend or phone number is selected
    if (
      isNeighborhoodWalk ||
      selectedFriends.length > 0 ||
      phoneNumbers.length > 0
    ) {
      onContinue();
    }
  };

  // Update the map when showing the neighborhood view
  useEffect(() => {
    if (isNeighborhoodWalk && formData.location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500
      );
    }
  }, [isNeighborhoodWalk, formData.location]);

  return (
    <BrandGradient style={styles.container}>
      <YStack gap="$4" paddingHorizontal="$4" paddingVertical="$4" flex={1}>
        {isNeighborhoodWalk && (
          <YStack gap="$4">
            <View style={styles.mapContainer}>
              {formData.location ? (
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: formData.location.latitude,
                    longitude: formData.location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: formData.location.latitude,
                      longitude: formData.location.longitude,
                    }}
                  />
                  <Circle
                    center={{
                      latitude: formData.location.latitude,
                      longitude: formData.location.longitude,
                    }}
                    radius={1600} // 1 mile ≈ 1600 meters
                    strokeWidth={2}
                    strokeColor={COLORS.action}
                    fillColor={`${COLORS.action}30`} // 30 for opacity
                  />
                </MapView>
              ) : (
                <View style={[styles.map, styles.placeholderMap]}>
                  <Text color={COLORS.text}>No location selected</Text>
                </View>
              )}
            </View>

            <Card style={styles.messageCard}>
              <YStack gap="$3" padding="$4">
                <XStack alignItems="center" gap="$2">
                  <MapPin size={24} color={COLORS.action} />
                  <Text fontSize={18} fontWeight="bold" color={COLORS.text}>
                    Neighborhood Walk
                  </Text>
                </XStack>
                <Text fontSize={16} color={COLORS.TEXT_LABEL} lineHeight={22}>
                  We'll invite users within a 1-mile radius of your location to
                  join your walk. This is a great way to meet neighbors and make
                  new walking buddies!
                </Text>
              </YStack>
            </Card>
          </YStack>
        )}

        {isFriendsWalk && (
          <YStack gap="$4">
            <XStack
              backgroundColor="white"
              borderRadius={10}
              alignItems="center"
              paddingHorizontal={15}
              marginBottom="$2"
            >
              <Search color={COLORS.TEXT_LABEL} size="$3" />
              <Input
                placeholder="Search friends"
                value={searchQuery}
                onChangeText={setSearchQuery}
                backgroundColor="white"
                borderRadius={10}
                paddingHorizontal={15}
                fontSize={16}
                flex={1}
                borderWidth={0}
                color={COLORS.text}
              />
            </XStack>

            <ScrollView style={styles.friendsListContainer}>
              <FriendsList
                onSelectFriend={(friend) => handleFriendToggle(friend.id)}
                title="Select Friends"
              />
            </ScrollView>

            <YStack gap="$3" style={styles.inviteContainer}>
              <XStack alignItems="center" gap="$2" marginBottom="$2">
                <MessageCircle size={20} color={COLORS.textOnDark} />
                <Text fontSize={18} fontWeight="500" color={COLORS.textOnDark}>
                  Invite by phone number
                </Text>
              </XStack>

              <XStack gap="$2">
                <Input
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  backgroundColor="white"
                  borderRadius={10}
                  fontSize={16}
                  flex={1}
                  color={COLORS.text}
                />
                <Button
                  backgroundColor={COLORS.action}
                  color={COLORS.textOnDark}
                  onPress={addPhoneNumber}
                  disabled={!phoneNumber.trim()}
                  icon={<UserPlus size={18} />}
                >
                  Add
                </Button>
              </XStack>

              {phoneNumbers.length > 0 && (
                <YStack gap="$2" marginTop="$2">
                  <Text fontSize={14} color={COLORS.textOnDark}>
                    Phone numbers to invite:
                  </Text>
                  {phoneNumbers.map((number, index) => (
                    <XStack
                      key={index}
                      alignItems="center"
                      justifyContent="space-between"
                      backgroundColor="rgba(255,255,255,0.8)"
                      borderRadius={8}
                      paddingHorizontal={12}
                      paddingVertical={8}
                    >
                      <Text color={COLORS.text}>{number}</Text>
                      <TouchableOpacity
                        onPress={() => removePhoneNumber(number)}
                      >
                        <Text color="red">Remove</Text>
                      </TouchableOpacity>
                    </XStack>
                  ))}
                </YStack>
              )}
            </YStack>

            <Text
              fontSize={16}
              color={COLORS.textOnDark}
              marginTop="$2"
              textAlign="center"
            >
              {selectedFriends.length}{" "}
              {selectedFriends.length === 1 ? "friend" : "friends"} selected
              {phoneNumbers.length > 0 &&
                ` • ${phoneNumbers.length} phone ${
                  phoneNumbers.length === 1 ? "number" : "numbers"
                }`}
            </Text>
          </YStack>
        )}

        <XStack gap="$4" justifyContent="space-between" marginTop="auto">
          <Button
            size="$5"
            backgroundColor={COLORS.actionSecondary}
            color={COLORS.textOnDark}
            onPress={onBack}
            flex={1}
          >
            Back
          </Button>
          <Button
            size="$5"
            backgroundColor={COLORS.action}
            color={COLORS.textOnDark}
            disabled={
              !isNeighborhoodWalk &&
              selectedFriends.length === 0 &&
              phoneNumbers.length === 0
            }
            opacity={
              !isNeighborhoodWalk &&
              selectedFriends.length === 0 &&
              phoneNumbers.length === 0
                ? 0.6
                : 1
            }
            onPress={handleContinue}
            flex={1}
          >
            Next
          </Button>
        </XStack>
      </YStack>
    </BrandGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 220,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  map: {
    height: "100%",
    width: "100%",
  },
  placeholderMap: {
    backgroundColor: "rgba(200, 200, 200, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  messageCard: {
    backgroundColor: "white",
    borderRadius: 10,
  },
  friendsListContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    marginVertical: 8,
  },
  inviteContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 16,
  },
});

export default InviteSelection;
