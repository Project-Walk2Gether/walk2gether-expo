import {
  collection,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";
import { LinearGradient } from "@tamagui/linear-gradient";
import { MapPin, MessageCircle, UserPlus, X } from "@tamagui/lucide-icons";
import React, { useEffect, useRef, useState } from "react";
import MapView from "react-native-maps";
import { Button, Card, Input, Text, XStack, YStack } from "tamagui";
import { useAuth } from "../../../context/AuthContext";
import { useWalkForm } from "../../../context/WalkFormContext";
import { COLORS } from "../../../styles/colors";
import FriendsList from "../../FriendsList";
import WizardWrapper from "./WizardWrapper";

interface InviteSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

// PhoneNumberChip: pill-shaped chip for phone numbers
const PhoneNumberChip: React.FC<{ number: string; onRemove: () => void }> = ({
  number,
  onRemove,
}) => (
  <XStack
    alignItems="center"
    backgroundColor="#f3f4f6"
    borderRadius={9999}
    paddingVertical={6}
    paddingHorizontal={14}
    marginVertical={2}
    shadowColor="#000"
    shadowOpacity={0.07}
    shadowRadius={4}
    shadowOffset={{ width: 0, height: 2 }}
    gap={8}
  >
    <Text color="#222" fontSize={15}>
      {number}
    </Text>
    <Button
      size="$2"
      circular
      chromeless
      onPress={onRemove}
      aria-label="Remove phone number"
      backgroundColor="transparent"
      hoverStyle={{ backgroundColor: "#fee2e2" }}
      pressStyle={{ backgroundColor: "#fecaca" }}
    >
      <X size={16} color="#ef4444" />
    </Button>
  </XStack>
);

export const InviteSelection: React.FC<InviteSelectionProps> = ({
  onContinue,
  onBack,
}) => {
  const { formData, updateFormData } = useWalkForm();
  const { user } = useAuth();
  const [selectedFriends, setSelectedFriends] = useState<string[]>(
    formData.invitedUserIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(
    formData.invitedPhoneNumbers || []
  );
  const [hasFriends, setHasFriends] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const mapRef = useRef<MapView>(null);

  // Check if user has any friends
  useEffect(() => {
    const checkForFriends = async () => {
      if (!user) return;

      setLoadingFriends(true);
      try {
        const db = getFirestore();
        const friendsRef = collection(db, `users/${user.uid}/friends`);
        const snapshot = await getDocs(friendsRef);
        setHasFriends(snapshot.size > 0);
      } catch (error) {
        console.error("Error checking for friends:", error);
        setHasFriends(false);
      } finally {
        setLoadingFriends(false);
      }
    };

    checkForFriends();
  }, [user]);

  const isNeighborhoodWalk = formData.walkType === "neighborhood";
  const isFriendsWalk = formData.walkType === "friends";

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends((prev) => {
      if (prev.includes(friendId)) {
        const updated = prev.filter((id) => id !== friendId);
        updateFormData({ invitedUserIds: updated });
        return updated;
      } else {
        const updated = [...prev, friendId];
        updateFormData({ invitedUserIds: updated });
        return updated;
      }
    });
  };

  const addPhoneNumber = () => {
    if (phoneNumber.trim() && !phoneNumbers.includes(phoneNumber.trim())) {
      const updatedNumbers = [...phoneNumbers, phoneNumber.trim()];
      setPhoneNumbers(updatedNumbers);
      setPhoneNumber("");

      // Store phone numbers separately in the form data
      updateFormData({ invitedPhoneNumbers: updatedNumbers });
    }
  };

  const removePhoneNumber = (numberToRemove: string) => {
    const updatedNumbers = phoneNumbers.filter((num) => num !== numberToRemove);
    setPhoneNumbers(updatedNumbers);

    // Update the invitedPhoneNumbers in form data
    updateFormData({ invitedPhoneNumbers: updatedNumbers });
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
    <LinearGradient
      flex={1}
      colors={["#f7fafc", "#e0e7ef"]}
      start={[0, 0]}
      end={[0, 1]}
    >
      <WizardWrapper
        onContinue={handleContinue}
        onBack={onBack}
        continueDisabled={
          !isNeighborhoodWalk &&
          selectedFriends.length === 0 &&
          phoneNumbers.length === 0
        }
        continueText="Next"
      >
        <YStack flex={1} gap="$4" paddingHorizontal="$2" paddingVertical="$4">
          {isNeighborhoodWalk && (
            <YStack gap="$4">
              <Card
                elevate
                backgroundColor="#fff"
                borderRadius={20}
                padding="$5"
                shadowColor="#000"
                shadowOpacity={0.07}
                shadowRadius={7}
                shadowOffset={{ width: 0, height: 3 }}
              >
                <XStack alignItems="center" gap="$2" marginBottom="$2">
                  <MapPin size={22} color={COLORS.text} />
                  <Text fontSize={19} fontWeight="bold" color={COLORS.text}>
                    Neighborhood Walk
                  </Text>
                </XStack>
                <Text fontSize={16} color={COLORS.text} lineHeight={22}>
                  We'll invite users within a 1-mile radius of your location to
                  join your walk. This is a great way to meet neighbors and make
                  new walking buddies!
                </Text>
              </Card>
            </YStack>
          )}

          {isFriendsWalk && (
            <YStack gap="$5">
              {hasFriends ? (
                <Card
                  elevate
                  backgroundColor="#fff"
                  borderRadius={20}
                  marginVertical="$2"
                  padding="$3"
                  shadowColor="#000"
                  shadowOpacity={0.06}
                  shadowRadius={5}
                  shadowOffset={{ width: 0, height: 2 }}
                >
                  <FriendsList
                    onSelectFriend={(friend) => handleFriendToggle(friend.id)}
                    title="Select Friends"
                    searchEnabled={true}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                </Card>
              ) : null}

              <YStack
                gap="$3"
                backgroundColor="rgba(255, 255, 255, 0.7)"
                borderRadius={18}
                padding="$5"
                shadowColor="#000"
                shadowOpacity={0.05}
                shadowRadius={7}
                shadowOffset={{ width: 0, height: 2 }}
              >
                <XStack alignItems="center" gap="$2" marginBottom="$2">
                  <MessageCircle size={20} color={COLORS.textOnLight} />
                  <Text
                    fontSize={19}
                    fontWeight="700"
                    color={COLORS.textOnLight}
                  >
                    Invite by phone number
                  </Text>
                </XStack>
                <Text fontSize={15} color="#6b7280" marginBottom={2}>
                  Add friends not yet on Walk2Gether by inviting them via text.
                </Text>
                <XStack gap="$2" alignItems="center">
                  <Input
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    backgroundColor="#fff"
                    borderRadius={9999}
                    fontSize={16}
                    flex={1}
                    color={COLORS.text}
                    paddingLeft={16}
                    borderWidth={1}
                    borderColor="#e5e7eb"
                  />
                  <Button
                    backgroundColor={COLORS.action}
                    color={COLORS.textOnDark}
                    onPress={addPhoneNumber}
                    disabled={!phoneNumber.trim()}
                    circular
                    size="$4"
                    icon={<UserPlus size={20} color="#fff" />}
                    aria-label="Add phone number"
                    hoverStyle={{ backgroundColor: "#6d4c2b" }}
                    pressStyle={{ backgroundColor: "#4b2e13" }}
                  />
                </XStack>

                {phoneNumbers.length > 0 && (
                  <YStack gap="$2" marginTop="$2">
                    <Text
                      fontSize={14}
                      color={COLORS.textOnLight}
                      marginBottom={2}
                    >
                      Phone numbers to invite:
                    </Text>
                    <XStack flexWrap="wrap" gap={8}>
                      {phoneNumbers.map((number, index) => (
                        <PhoneNumberChip
                          key={index}
                          number={number}
                          onRemove={() => removePhoneNumber(number)}
                        />
                      ))}
                    </XStack>
                  </YStack>
                )}
              </YStack>

              <Text
                fontSize={16}
                color={COLORS.textOnDark}
                marginTop="$2"
                textAlign="center"
                fontWeight="600"
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
        </YStack>
      </WizardWrapper>
    </LinearGradient>
  );
};

export default InviteSelection;
