import { COLORS } from "@/styles/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Card, Input, Spinner, Text, XStack, YStack } from "tamagui";
import { UserData, WithId } from "walk2gether-shared";

interface Props {
  users: Array<UserData & {id: string}>;
  onSelectUser: (user: UserData & {id: string}) => void;
  searchEnabled?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  selectedUserIds?: string[]; // For tracking selected users
  loading?: boolean;
  emptyMessage?: string;
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
              backgroundColor={isSelected ? "$blue2" : "white"}
              // Add a border when selected
              borderWidth={isSelected ? 2 : 1}
              borderColor={isSelected ? "$blue8" : "$gray5"}
              onPress={() => onSelectUser(user)}
            >
              <Card.Header padded>
                <XStack alignItems="center" justifyContent="space-between">
                  <XStack alignItems="center" gap="$2">
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "person"}
                      size={20}
                      color={isSelected ? "#3f78e0" : "#4285F4"}
                    />
                    <Text>{user.name}</Text>
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
