import { Timestamp } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Text, View } from "tamagui";

interface Props {
  startTime?: Timestamp | any; // Handle both Firebase and shared Timestamp types
  endTime?: Timestamp | any; // Optional for calculation
}

export default function RoundCountdown({ startTime, endTime }: Props) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    // We need either startTime and endTime to calculate
    if (!startTime || !endTime) {
      setTimeRemaining("--:--");
      return;
    }

    const calculateTimeRemaining = () => {
      let end: Date;
      try {
        // Handle both Firebase and shared Timestamp types
        end = endTime.toDate ? endTime.toDate() : new Date(endTime);
      } catch (error) {
        console.error("Error converting endTime to Date:", error);
        setTimeRemaining("--:--");
        return;
      }

      const now = new Date();

      if (now >= end) {
        setTimeRemaining("Time's up!");
        return;
      }

      const diffMs = end.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${diffMinutes}:${diffSeconds < 10 ? "0" : ""}${diffSeconds}`
      );
    };

    // Calculate immediately and then every second
    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [startTime, endTime]);

  return (
    <View bg="white" px="$2" py="$1.5" borderRadius="$6">
      <Text fontSize={15} color="black">
        {timeRemaining}
      </Text>
    </View>
  );
}
