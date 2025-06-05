import { COLORS } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Card, Input, Spinner, Text, XStack, YStack, View } from "tamagui";
import { UserData, WithId } from "walk2gether-shared";
import { UserAvatar } from "../UserAvatar";

interface Props {
  users: Array<UserData & {id: string}>;
  onSelectUser: (user: UserData & {id: string}) => void;
  searchEnabled?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  selectedUserIds?: string[]; // For tracking selected users
  loading?: boolean;
  emptyMessage?: string;
  // Array of user IDs who have accepted the invitation
  acceptedUserIds?: string[];
}

export default function UserList({
  users,
  onSelectUser,
  searchEnabled = false,
  searchQuery = "",
  onSearchChange,
  selectedUserIds = [], // Default to empty array
  loading = false,
  emptyMessage = "No users found.",
  acceptedUserIds = [], // Default to empty array
}: Props) {
  // Filter users if search is enabled and has query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  if (loading) {
    return (
      <YStack gap="$2" alignItems="center" justifyContent="center" p="$4">
        <Spinner size="large" color="$blue10" />
        <Text>Loading users...</Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$2">
      {/* Only show search if enabled and there are users */}
      {searchEnabled && users.length > 0 && (
        <XStack marginVertical="$2" width="100%">
          {/* Container with relative positioning to properly contain the absolute element */}
          <XStack position="relative" flex={1}>
            <Input
              placeholder="Search users"
              value={searchQuery}
              onChangeText={onSearchChange}
              backgroundColor="white"
              borderRadius={10}
              paddingLeft={80} // Exact pixel value for search icon + space
              paddingRight={12}
              fontSize={16}
              flex={1}
              size="$5"
              borderWidth={0}
              color={COLORS.text}
            />
          </XStack>
        </XStack>
      )}

      {users.length === 0 ? (
        <Text color="$gray10">{emptyMessage}</Text>
      ) : (
        filteredUsers.map((user) => {
          // Check if this user is selected
          const isSelected = selectedUserIds.includes(user.id);

          return (
            <Card
              key={user.id}
              pressStyle={{ opacity: 0.8 }}
              // Use backgroundColor to indicate selection state
              backgroundColor={isSelected ? "$blue3" : "white"}
              // Add a border when selected
              borderWidth={isSelected ? 2 : 1}
              borderColor={isSelected ? "$blue9" : "$gray5"}
              onPress={() => onSelectUser(user)}
            >
              {/* Absolutely positioned checkbox in top left corner */}
              {isSelected && (
                <XStack 
                  position="absolute"
                  top={-8}
                  left={-8}
                  zIndex={5}
                  backgroundColor="white"
                  borderRadius={14}
                  width={28}
                  height={28}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={1}
                  borderColor="$blue9"
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={26} 
                    color="$blue9" 
                  />
                </XStack>
              )}
              
              <Card.Header padded>
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$3">
                    <UserAvatar 
                      uid={user.id} 
                      size={40} 
                      backgroundColor={COLORS.primary}
                    />
                    
                    <YStack>
                      <Text 
                        fontSize={16}
                        fontWeight={isSelected ? "600" : "400"}
                      >
                        {user.name}
                      </Text>
                      {acceptedUserIds.includes(user.id) && (
                        <XStack paddingTop="$1">
                          <Text 
                            fontSize={12} 
                            color="$green9"
                            fontWeight="500"
                          >
                            Accepted
                          </Text>
                        </XStack>
                      )}
                    </YStack>
                  </XStack>
                </XStack>
              </Card.Header>
            </Card>
          );
        })
      )}
    </YStack>
  );
}
