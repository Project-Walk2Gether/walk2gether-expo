import { Clock, Footprints, MonitorSmartphone, User, Users } from "@tamagui/lucide-icons";

/**
 * Defines the visual styling for different walk types
 * This serves as a single source of truth for walk type styling across the app
 */
export const WALK_TYPES = {
  // Friend Walk
  friends: {
    icon: User,
    gradient: ["#0B3D0B", "#A2C523"] as const,
    backgroundColor: "#5A67F2",
    label: "Friend Walk",
    description: "Walk with a friend",
  },

  // Neighborhood Walk
  neighborhood: {
    icon: Footprints,
    gradient: ["#FDB87D", "#2EB94E"] as const,
    backgroundColor: "#4CD964",
    label: "Neighborhood Walk",
    description: "Walk and get to know your neighbors",
  },

  // Group Walk
  meetup: {
    icon: Users,
    gradient: ["#FF6A55", "#A0D8EF"] as const,
    backgroundColor: "#FF6A55",
    label: "Meetup Walk",
    description: "Walk with a group of friends",
  },

  // Virtual Walk
  virtual: {
    icon: MonitorSmartphone,
    gradient: ["#8A2BE2", "#4169E1"] as const,
    backgroundColor: "#8A2BE2",
    label: "Virtual Walk",
    description: "Connect virtually from anywhere",
  },

  // Default Walk (fallback)
  default: {
    icon: Clock,
    gradient: ["#5A4430", "#846041"] as const,
    backgroundColor: "#5A4430",
    label: "Walk",
    description: "Go for a walk",
  },
};

/**
 * Gets the styling data for a specific walk type
 * @param type The walk type
 * @returns The styling data for the specified walk type
 */
export const getWalkTypeData = (type?: string) => {
  if (type && type in WALK_TYPES) {
    return WALK_TYPES[type as keyof typeof WALK_TYPES];
  }
  return WALK_TYPES.default;
};
