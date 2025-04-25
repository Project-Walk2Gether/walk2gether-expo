import { Check, ExternalLink, Map, MapPin } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Button, Text, View, XStack } from "tamagui";
import { COLORS } from "../../styles/colors";

interface Props {
  walk: any;
  isMine: boolean;
  isPast: boolean;
  isUpcoming: boolean;
  isRSVPed: boolean;
  handleRSVP: () => void;
  openInGoogleMaps: () => void;
  openInAppleMaps: () => void;
}

const WalkCardFooter: React.FC<Props> = ({
  walk,
  isMine,
  isPast,
  isUpcoming,
  isRSVPed,
  handleRSVP,
  openInGoogleMaps,
  openInAppleMaps,
}) => {
  import { isActive, isFuture, isPast } from "../../utils/walkUtils";

const participantCount = walk.participants ? walk.participants.length : 0;
let peopleText = "";
if (isActive(walk)) {
  peopleText = `${participantCount} people walking`;
} else if (isFuture(walk)) {
  peopleText = `${participantCount} people going`;
} else if (isPast(walk)) {
  peopleText = `${participantCount} people joined`;
}

const PeopleCountText = ({ color = "#333" }: { color?: string }) => (
  <Text color={color} fontWeight="600" fontSize={14} mt={2}>
    {peopleText}
  </Text>
);

return (
    <>
      {/* Location Map with Overlay Footer */}
      {walk.location?.latitude && walk.location?.longitude ? (
        <View
          width="100%"
          height={140}
          borderRadius={0}
          overflow="hidden"
          position="relative"
          marginBottom={0}
        >
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: walk.location.latitude,
              longitude: walk.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents="none"
          >
            <Marker
              coordinate={{
                latitude: walk.location.latitude,
                longitude: walk.location.longitude,
              }}
              title={walk.location.name || "Location"}
            />
          </MapView>
          {/* Overlay footer */}
          <LinearGradient
            colors={["rgba(0,0,0,0.25)", "transparent"]}
            style={StyleSheet.absoluteFillObject}
          >
            <Text
              color="#fff"
              fontWeight="600"
              fontSize={16}
              flex={1}
              marginRight={12}
              numberOfLines={1}
            >
              {walk.location.name || "Location TBD"}
            </Text>
            <PeopleCountText color="#fff" />
            </Text>
            {walk.type !== "neighborhood" && (
              <Button
                size="$3"
                backgroundColor={COLORS.background}
                borderColor={COLORS.primary}
                borderWidth={1}
                color={COLORS.primary}
                onPress={
                  Platform.OS === "ios" ? openInAppleMaps : openInGoogleMaps
                }
                borderRadius={12}
                paddingHorizontal="$3"
                hoverStyle={{ opacity: 0.9 }}
                pressStyle={{ opacity: 0.8 }}
                icon={<Map size="$1" color={COLORS.primary} />}
                iconAfter={<ExternalLink />}
                marginLeft={8}
              >
                Open
              </Button>
            )}
          </LinearGradient>
        </View>
      ) : (
        <XStack gap="$2" alignItems="center" flex={1}>
          <View
            backgroundColor="rgba(255,255,255,0.18)"
            borderRadius={99}
            padding={2}
            alignItems="center"
            justifyContent="center"
          >
            <View style={styles.iconContainer}>
              <MapPin size="$1.5" color={COLORS.primary} />
            </View>
            <Text fontSize="$4" fontWeight="600" flex={1} color="#333">
              {walk.location?.name || "Location TBD"}
            </Text>
            <PeopleCountText color="#333" />
            </Text>
          </View>
          {!isMine && !isPast && isUpcoming && (
            <Button
              backgroundColor={COLORS.action}
              color={COLORS.textOnDark}
              borderColor={COLORS.action}
              borderWidth={1}
              onPress={handleRSVP}
              marginTop={8}
              fontWeight="bold"
              size="$3"
              borderRadius={12}
              hoverStyle={{ opacity: 0.95 }}
              pressStyle={{ opacity: 0.8 }}
              iconAfter={isRSVPed ? <Check size="$1" /> : undefined}
            >
              {isRSVPed ? "RSVP'd" : `Request to join`}
            </Button>
          )}
        </XStack>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    borderRadius: 0,
    overflow: "hidden",
    position: "relative",
    marginBottom: 0,
  },
  map: StyleSheet.absoluteFillObject,
  mapOverlayFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 2,
  },
  mapLocationText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  mapOpenButton: {
    marginLeft: 8,
  },
  buttonHover: {
    opacity: 0.9,
  },
  buttonPress: {
    opacity: 0.8,
  },
  actionButtonHover: {
    opacity: 0.95,
  },
  actionButtonPress: {
    opacity: 0.8,
  },
  iconContainer: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 99,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WalkCardFooter;
