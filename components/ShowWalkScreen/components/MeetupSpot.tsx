import React from 'react';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { MapPin } from '@tamagui/lucide-icons';
import { Text, YStack, XStack } from 'tamagui';
import { COLORS } from '../../../styles/colors';

interface MeetupSpotProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
}

const MeetupSpot: React.FC<MeetupSpotProps> = ({ 
  coordinate, 
  title = "MEETUP SPOT" 
}) => {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.95 }}
    >
      <YStack alignItems="center">
        {/* Label */}
        <XStack 
          backgroundColor="white"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          alignItems="center"
          marginBottom="$2"
          borderWidth={2}
          borderColor={COLORS.success}
          shadowColor="#000"
          shadowOpacity={0.25}
          shadowRadius={3}
          style={{
            shadowOffset: { width: 0, height: 2 },
            elevation: 5,
          }}
        >
          <Text fontSize={14} fontWeight="bold" color={COLORS.text}>
            {title}
          </Text>
        </XStack>
        
        {/* Pin head and stem */}
        <View style={{
          alignItems: 'center',
        }}>
          {/* Pin head - large, unmissable circle */}
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: COLORS.success,
            borderWidth: 4,
            borderColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 6,
            zIndex: 2,
          }} />
          
          {/* Pin stem */}
          <View style={{
            width: 6,
            height: 16,
            backgroundColor: COLORS.success,
            borderBottomLeftRadius: 3,
            borderBottomRightRadius: 3,
            marginTop: -3,
            zIndex: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 4,
          }} />
        </View>
      </YStack>
    </Marker>
  );
};

export default MeetupSpot;
