import { Calendar } from "@tamagui/lucide-icons";
import React from "react";
import { Text, XStack } from "tamagui";

interface WalkCardTimeRowProps {
  formattedDate: string;
  formattedTime: string;
  walkEndTime: Date;
  walkDate: Date;
  durationMinutes: number;
  isToday: boolean;
}

const WalkCardTimeRow: React.FC<WalkCardTimeRowProps> = ({
  formattedDate,
  formattedTime,
  walkEndTime,
  walkDate,
  durationMinutes,
  isToday,
}) => {
  return (
    <XStack
      gap="$4"
      alignItems="center"
      justifyContent="space-between"
      px="$3"
      py="$2"
      width="100%"
    >
      {/* Date Section */}
      <XStack alignItems="center" gap="$2">
        <Calendar size={20} color="#2D2D2D" />
        <Text fontWeight="600" fontSize="$3">
          {isToday ? "Today" : formattedDate}
        </Text>
        <Text flexGrow={1} fontWeight="600" fontSize="$3">
          {formattedTime}
        </Text>
        {durationMinutes > 0 && (
          <XStack
            px={10}
            py={2}
            borderRadius={20}
            backgroundColor="#7B5AF5" // Use your COLORS.primary if you prefer
            ml="$2"
          >
            <Text fontSize="$3" color="#fff" fontWeight="bold">
              {durationMinutes} min
            </Text>
          </XStack>
        )}
      </XStack>
    </XStack>
  );
};

export default WalkCardTimeRow;
