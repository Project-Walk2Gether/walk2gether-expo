import { useWalkForm } from "@/context/WalkFormContext";
import { COLORS } from "@/styles/colors";
import { combineDateAndTime } from "@/utils/timezone";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timestamp } from "@react-native-firebase/firestore";
import { Clock, Edit3, Plus, Star, Trash2 } from "@tamagui/lucide-icons";
import { format } from "date-fns";
import React, { useState } from "react";
import { Alert, Modal, Platform, TouchableOpacity } from "react-native";
import { Calendar as RNCalendar } from "react-native-calendars";
import { Button, Text, View, XStack, YStack } from "tamagui";
import MenuButton from "../../MenuButton";
import { MenuItem } from "../../../context/MenuContext";
import SelectableOption from "../../SelectableOption";
import WizardWrapper from "./WizardWrapper";

interface Props {
  onContinue: () => void;
  onBack?: () => void;
  onSubmit?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

// Simple time entry structure - will convert to TimeOption when saving to form
type TimeEntry = {
  time: Date;
  isPrimary: boolean;
};

export const TimeSelection: React.FC<Props> = ({
  onContinue,
  onBack,
  onSubmit,
}) => {
  const { formData, updateFormData } = useWalkForm();

  // Determine if this is a friends walk or neighborhood walk
  const isFriendsWalk = formData.type === "friends";
  const [timeOption, setTimeOption] = useState<"now" | "future" | null>(null);
  const [selectorExpanded, setSelectorExpanded] = useState(true); // Start expanded

  // Time entry management - starts completely empty
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form state - starts with no selection
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const isAndroid = Platform.OS === "android";

  // Open modal for adding or editing
  const openModal = (editIndex?: number) => {
    if (editIndex !== undefined) {
      // Editing existing entry - extract date and time from combined time
      const entry = timeEntries[editIndex];
      setSelectedDate(entry.time); // time contains the full date/time
      setSelectedTime(entry.time);
      setEditingIndex(editIndex);
    } else {
      // Adding new entry - start fresh with no pre-selection
      setSelectedDate(null);
      setSelectedTime(null);
      setEditingIndex(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setEditingIndex(null);
  };

  // Handle date selection
  const handleDateChange = (day: any) => {
    const newDate = new Date(day.timestamp);
    setSelectedDate(newDate);

    // Only auto-set time if not already set
    if (!selectedTime) {
      const now = new Date();
      setSelectedTime(
        new Date(1970, 0, 1, now.getHours(), now.getMinutes(), 0, 0)
      );
    }
  };

  // Handle time selection
  const handleTimeChange = (_: any, selectedTimeValue?: Date) => {
    if (selectedTimeValue) {
      setSelectedTime(selectedTimeValue);
    }
  };

  // Save time entry
  const saveTimeEntry = () => {
    if (!selectedDate || !selectedTime) return;

    const newEntry: TimeEntry = {
      time: combineDateAndTime(selectedDate!, selectedTime!),
      isPrimary: timeEntries.length === 0, // First entry is primary
    };

    if (editingIndex !== null) {
      // Update existing entry
      const updated = [...timeEntries];
      updated[editingIndex] = {
        ...newEntry,
        isPrimary: updated[editingIndex].isPrimary,
      };
      setTimeEntries(updated);
      updateFormDataFromEntries(updated);
    } else {
      // Add new entry
      const updated = [...timeEntries, newEntry];
      setTimeEntries(updated);
      updateFormDataFromEntries(updated);
    }

    closeModal();
  };

  // Set entry as primary
  const setPrimary = (index: number) => {
    const updated = timeEntries.map((entry, i) => ({
      ...entry,
      isPrimary: i === index,
    }));
    setTimeEntries(updated);
    updateFormDataFromEntries(updated);
  };

  // Remove entry
  const removeEntry = (index: number) => {
    const updated = timeEntries.filter((_, i) => i !== index);

    // If we removed the primary, make the first remaining entry primary
    if (updated.length > 0 && !updated.some((e) => e.isPrimary)) {
      updated[0].isPrimary = true;
    }

    setTimeEntries(updated);
    updateFormDataFromEntries(updated);
  };

  // Helper function to check if a time option has votes
  const hasVotes = (entry: TimeEntry): boolean => {
    // For now, we'll simulate this - in real implementation, this would check the votes object
    // TODO: Update when we integrate with actual vote data from Firestore
    return false; // Placeholder - no votes yet
  };

  // Helper function to get vote count for a time option
  const getVoteCount = (
    entry: TimeEntry
  ): { canMake: number; cantMake: number } => {
    // TODO: Calculate from actual votes object
    return { canMake: 0, cantMake: 0 };
  };

  // Handle choosing a time option with confirmation
  const handleChooseTime = (entry: TimeEntry, index: number) => {
    const timeString = format(entry.time, "EEEE, MMMM d 'at' h:mm a");

    Alert.alert(
      "Choose Walk Time",
      `Are you sure you want to choose ${timeString} as the walk time?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Choose",
          onPress: () => {
            // Set this as the primary time (move to index 0)
            const newEntries = [...timeEntries];
            const [chosenEntry] = newEntries.splice(index, 1);
            newEntries.unshift(chosenEntry);
            setTimeEntries(newEntries);
            updateFormDataFromEntries(newEntries);
          },
        },
      ]
    );
  };

  // Create menu items for time entry actions
  const createMenuItems = (entry: TimeEntry, index: number): MenuItem[] => {
    const items: MenuItem[] = [];

    // Only show edit if there are no votes
    if (!hasVotes(entry)) {
      items.push({
        label: "Edit",
        icon: <Edit3 size={16} />,
        onPress: () => openModal(index),
      });
    }

    items.push({
      label: "Delete",
      icon: <Trash2 size={16} />,
      onPress: () => removeEntry(index),
      theme: "red",
    });

    return items;
  };

  // Update form data from time entries
  const updateFormDataFromEntries = (entries: TimeEntry[]) => {
    const primary = entries.find((e) => e.isPrimary);
    const alternates = entries.filter((e) => !e.isPrimary);

    if (primary) {
      const primaryTimestamp = Timestamp.fromDate(primary.time);
      updateFormData({ date: primaryTimestamp } as any);
    } else {
      // Clear primary if no entries
      updateFormData({ date: null } as any);
    }

    if (alternates.length > 0) {
      const alternateTimestamps = alternates.map((alt) => {
        // Convert TimeEntry to the new schema format
        return {
          time: Timestamp.fromDate(alt.time),
          votes: {},
        };
      });
      updateFormData({ timeOptions: alternateTimestamps } as any);
    } else {
      // Clear alternates if none
      updateFormData({ timeOptions: [] } as any);
    }
  };

  // Handle "now" option
  const handleNowOption = () => {
    updateFormData({
      date: Timestamp.fromDate(new Date()),
    });
    setTimeOption("now");
    setSelectorExpanded(false); // Collapse after selection
  };

  // Handle "future" option - immediately open modal
  const handleFutureOption = () => {
    setTimeOption("future");
    setSelectorExpanded(false); // Collapse after selection
    openModal(); // Immediately open the modal
  };

  // Handle edit button - expand selector
  const handleEditTimeOption = () => {
    setSelectorExpanded(true);
  };

  const handleContinue = () => {
    if (timeOption === "now") {
      updateFormData({
        date: Timestamp.fromDate(new Date()),
      });
    }
    if (onSubmit) {
      onSubmit();
    } else if (onContinue) {
      onContinue();
    }
  };

  return (
    <>
      <WizardWrapper
        onContinue={handleContinue}
        onBack={onBack}
        continueDisabled={
          (timeOption === "future" && timeEntries.length === 0) ||
          timeOption === null
        }
      >
        <YStack gap="$4" flex={1} p={16}>
          {/* Time option selector */}
          {selectorExpanded ? (
            <YStack gap="$3">
              <SelectableOption
                isSelected={timeOption === "now"}
                onPress={handleNowOption}
                title="Start walking now"
                description="Begin your walk immediately"
              />

              <SelectableOption
                isSelected={timeOption === "future"}
                onPress={handleFutureOption}
                title="Schedule for later"
                description="Pick a specific date and time"
              />
            </YStack>
          ) : (
            <XStack
              alignItems="center"
              justifyContent="space-between"
              padding="$3"
              backgroundColor="$gray1"
              borderRadius={12}
            >
              <Text fontSize={16} fontWeight="600">
                {timeOption === "now"
                  ? "Start walking now"
                  : "Schedule for later"}
              </Text>
              <Button
                size="$2"
                chromeless
                onPress={handleEditTimeOption}
                icon={<Edit3 size={16} />}
              >
                Edit
              </Button>
            </XStack>
          )}

          {/* Future time selection */}
          {timeOption === "future" && (
            <YStack gap="$4" flex={1}>
              {/* Show time entries if any exist */}
              {timeEntries.length > 0 && (
                <YStack gap="$4">
                  {/* Primary time section */}
                  {timeEntries
                    .filter((entry) => entry.isPrimary)
                    .map((entry, originalIndex) => {
                      const index = timeEntries.findIndex((e) => e === entry);
                      return (
                        <YStack key={`primary-${index}`} gap="$2">
                          <Text fontSize={18} fontWeight="600">
                            Walk Time
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              !entry.isPrimary && handleChooseTime(entry, index)
                            }
                            style={{
                              backgroundColor: "#f5f5f5",
                              borderRadius: 12,
                              padding: 12,
                            }}
                          >
                            <XStack
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <XStack alignItems="center" gap="$3" flex={1}>
                                <Star
                                  size={20}
                                  color={COLORS.action}
                                  fill={COLORS.action}
                                />
                                <YStack flex={1}>
                                  <Text fontSize={16} fontWeight="600">
                                    {format(entry.time, "EEEE, MMMM d")}
                                  </Text>
                                  <Text fontSize={14} color="$gray10">
                                    {format(entry.time, "h:mm a")}
                                  </Text>
                                  <Text
                                    fontSize={12}
                                    color={COLORS.action}
                                    fontWeight="600"
                                  >
                                    Chosen Walk Time
                                  </Text>
                                </YStack>
                              </XStack>
                              <XStack alignItems="center" gap="$2">
                                {/* Show vote count if there are votes */}
                                {hasVotes(entry) && (
                                  <Text fontSize={12} color="$gray10">
                                    {getVoteCount(entry).canMake} can make it
                                  </Text>
                                )}

                                <MenuButton
                                  title="Time Options"
                                  items={createMenuItems(entry, index)}
                                />
                              </XStack>
                            </XStack>
                          </TouchableOpacity>
                        </YStack>
                      );
                    })}

                  {/* Other time options section */}
                  {timeEntries.filter((entry) => !entry.isPrimary).length >
                    0 && (
                    <YStack gap="$3">
                      <Text fontSize={18} fontWeight="600">
                        Other time options
                      </Text>
                      {timeEntries
                        .filter((entry) => !entry.isPrimary)
                        .map((entry) => {
                          const index = timeEntries.findIndex(
                            (e) => e === entry
                          );
                          return (
                            <TouchableOpacity
                              key={`other-${index}`}
                              onPress={() => handleChooseTime(entry, index)}
                              style={{
                                backgroundColor: "#f5f5f5",
                                borderRadius: 12,
                                padding: 12,
                              }}
                            >
                              <XStack
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <XStack alignItems="center" gap="$3" flex={1}>
                                  <Clock size={20} color="$gray10" />
                                  <YStack flex={1}>
                                    <Text fontSize={16} fontWeight="600">
                                      {format(entry.time, "EEEE, MMMM d")}
                                    </Text>
                                    <Text fontSize={14} color="$gray10">
                                      {format(entry.time, "h:mm a")}
                                    </Text>
                                  </YStack>
                                </XStack>
                                <XStack alignItems="center" gap="$2">
                                  {/* Show vote count if there are votes */}
                                  {hasVotes(entry) && (
                                    <Text fontSize={12} color="$gray10">
                                      {getVoteCount(entry).canMake} can make it
                                    </Text>
                                  )}

                                  <MenuButton
                                    title="Time Options"
                                    items={createMenuItems(entry, index)}
                                  />
                                </XStack>
                              </XStack>
                            </TouchableOpacity>
                          );
                        })}
                    </YStack>
                  )}
                </YStack>
              )}

              {/* Add time button */}
              <Button
                backgroundColor={COLORS.action}
                color="white"
                onPress={() => openModal()}
                icon={<Plus size={16} />}
              >
                {timeEntries.length === 0
                  ? "Set walk time"
                  : "Add another time option"}
              </Button>
            </YStack>
          )}
        </YStack>
      </WizardWrapper>

      {/* Time Selection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View flex={1} backgroundColor="white">
          <YStack flex={1} padding="$4" gap="$4">
            {/* Date selection */}
            <YStack gap="$2">
              <Text fontSize={16} fontWeight="600">
                Select Date
              </Text>
              <RNCalendar
                minDate={new Date().toISOString().split("T")[0]}
                onDayPress={handleDateChange}
                theme={{
                  selectedDayBackgroundColor: COLORS.action,
                  todayTextColor: COLORS.action,
                  arrowColor: COLORS.action,
                }}
                markedDates={
                  selectedDate
                    ? {
                        [selectedDate.toISOString().split("T")[0]]: {
                          selected: true,
                        },
                      }
                    : {}
                }
              />
            </YStack>

            {/* Time selection */}
            {selectedDate && (
              <YStack gap="$2">
                <Text fontSize={16} fontWeight="600">
                  Select Time
                </Text>
                {isAndroid ? (
                  <XStack alignItems="center" gap="$3">
                    <Text fontSize={16}>
                      {selectedTime
                        ? format(selectedTime, "h:mm a")
                        : "Select time"}
                    </Text>
                    <Button
                      onPress={() => setShowTimePicker(true)}
                      backgroundColor={COLORS.action}
                      color="white"
                    >
                      <Clock size={16} />
                    </Button>
                  </XStack>
                ) : (
                  selectedTime && (
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display="spinner"
                      onChange={handleTimeChange}
                    />
                  )
                )}
              </YStack>
            )}
          </YStack>

          {/* Bottom buttons */}
          <XStack
            gap="$3"
            padding="$4"
            borderTopWidth={1}
            borderTopColor="$gray4"
          >
            <Button flex={1} variant="outlined" onPress={closeModal}>
              Cancel
            </Button>
            <Button
              flex={1}
              backgroundColor={COLORS.action}
              color="white"
              onPress={saveTimeEntry}
              disabled={!selectedDate || !selectedTime}
            >
              {editingIndex !== null ? "Update" : "Save"}
            </Button>
          </XStack>

          {/* Android time picker modal */}
          {showTimePicker && isAndroid && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              display="default"
              onChange={(_, time) => {
                setShowTimePicker(false);
                if (time) handleTimeChange(_, time);
              }}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

export default TimeSelection;
