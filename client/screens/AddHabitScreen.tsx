import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Switch,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useHabits } from "@/contexts/HabitsContext";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { DayOfWeek, DAY_SHORT_NAMES, ALL_DAYS, WEEKDAYS, WEEKENDS } from "@/types/habit";

type AddHabitRouteProp = RouteProp<RootStackParamList, "AddHabit">;
type AddHabitNavigationProp = NativeStackNavigationProp<RootStackParamList, "AddHabit">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESET_OPTIONS = [
  { label: "Every day", days: ALL_DAYS },
  { label: "Weekdays", days: WEEKDAYS },
  { label: "Weekends", days: WEEKENDS },
  { label: "Custom", days: null },
] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: number) => void;
  options: { label: string; value: number }[];
  title: string;
  theme: any;
}

function DatePickerModal({ visible, onClose, onSelect, options, title, theme }: DatePickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.modalOption, { borderBottomColor: theme.cardBorder }]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <ThemedText style={styles.modalOptionText}>{item.label}</ThemedText>
              </Pressable>
            )}
            style={styles.modalList}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

export default function AddHabitScreen() {
  const navigation = useNavigation<AddHabitNavigationProp>();
  const route = useRoute<AddHabitRouteProp>();
  const { habitId } = route.params || {};
  const { addHabit, updateHabit, deleteHabit, getHabitById, settings } = useHabits();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const existingHabit = habitId ? getHabitById(habitId) : undefined;
  const isEditing = !!existingHabit;

  const today = new Date();
  const defaultStartDate = existingHabit?.startDate 
    ? new Date(existingHabit.startDate + "T00:00:00") 
    : today;

  const [name, setName] = useState(existingHabit?.name || "");
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>(existingHabit?.activeDays || ALL_DAYS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(existingHabit?.notifications?.enabled || false);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const saveScale = useSharedValue(1);
  const deleteScale = useSharedValue(1);
  const cancelScale = useSharedValue(1);

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
  }));

  const cancelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelScale.value }],
  }));

  const handleCancel = useCallback(() => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  }, [navigation, settings.hapticsEnabled]);

  const getSelectedPreset = (): string => {
    if (arraysEqual(activeDays, ALL_DAYS)) return "Every day";
    if (arraysEqual(activeDays, WEEKDAYS)) return "Weekdays";
    if (arraysEqual(activeDays, WEEKENDS)) return "Weekends";
    return "Custom";
  };

  const handlePresetSelect = (preset: typeof PRESET_OPTIONS[number]) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (preset.days) {
      setActiveDays([...preset.days]);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveDays((prev) => {
      if (prev.includes(day)) {
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
  };

  const handleMonthChange = (month: number) => {
    const newDate = new Date(startDate);
    newDate.setMonth(month);
    const daysInNewMonth = getDaysInMonth(newDate.getFullYear(), month);
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth);
    }
    setStartDate(newDate);
  };

  const handleDayChange = (day: number) => {
    const newDate = new Date(startDate);
    newDate.setDate(day);
    setStartDate(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(startDate);
    newDate.setFullYear(year);
    const daysInNewMonth = getDaysInMonth(year, newDate.getMonth());
    if (newDate.getDate() > daysInNewMonth) {
      newDate.setDate(daysInNewMonth);
    }
    setStartDate(newDate);
  };

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    if (activeDays.length === 0) {
      Alert.alert("Error", "Please select at least one day");
      return;
    }

    setIsSaving(true);

    try {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const startDateStr = formatDate(startDate);

      if (isEditing && existingHabit) {
        await updateHabit(existingHabit.id, { 
          name: trimmedName,
          activeDays,
          startDate: startDateStr,
          notifications: notificationsEnabled ? { enabled: true, time: "09:00" } : undefined,
        });
      } else {
        await addHabit(trimmedName, activeDays, startDateStr);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save habit. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [name, activeDays, notificationsEnabled, startDate, isEditing, existingHabit, addHabit, updateHabit, navigation, settings.hapticsEnabled]);

  const handleDelete = useCallback(() => {
    if (!existingHabit) return;

    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${existingHabit.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (settings.hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await deleteHabit(existingHabit.id);
            navigation.goBack();
          },
        },
      ]
    );
  }, [existingHabit, deleteHabit, navigation, settings.hapticsEnabled]);

  const isValid = name.trim().length > 0 && activeDays.length > 0;
  const selectedPreset = getSelectedPreset();

  const currentYear = today.getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => ({
    label: (currentYear - 5 + i).toString(),
    value: currentYear - 5 + i,
  }));

  const monthOptions = MONTHS.map((month, index) => ({
    label: month,
    value: index,
  }));

  const daysInCurrentMonth = getDaysInMonth(startDate.getFullYear(), startDate.getMonth());
  const dayOptions = Array.from({ length: daysInCurrentMonth }, (_, i) => ({
    label: (i + 1).toString(),
    value: i + 1,
  }));

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <AnimatedPressable
          onPress={handleCancel}
          onPressIn={() => {
            cancelScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
          }}
          onPressOut={() => {
            cancelScale.value = withSpring(1, { damping: 15, stiffness: 200 });
          }}
          style={[styles.cancelButton, cancelAnimatedStyle]}
        >
          <ThemedText style={[styles.cancelText, { color: theme.primary }]}>Cancel</ThemedText>
        </AnimatedPressable>
        <ThemedText style={styles.headerTitle}>
          {isEditing ? "Edit Habit" : "New Habit"}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.label}>Habit Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.cardBorder,
              },
            ]}
            placeholder="e.g., Exercise, Read, Meditate"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus={!isEditing}
            returnKeyType="done"
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Start Date</ThemedText>
          <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
            When did you start this habit?
          </ThemedText>
          <View style={styles.datePickerRow}>
            <Pressable
              onPress={() => setShowMonthPicker(true)}
              style={[styles.datePickerButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.cardBorder }]}
            >
              <ThemedText style={styles.datePickerText}>{MONTHS[startDate.getMonth()]}</ThemedText>
              <Feather name="chevron-down" size={16} color={theme.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => setShowDayPicker(true)}
              style={[styles.datePickerButton, styles.datePickerButtonSmall, { backgroundColor: theme.backgroundDefault, borderColor: theme.cardBorder }]}
            >
              <ThemedText style={styles.datePickerText}>{startDate.getDate()}</ThemedText>
              <Feather name="chevron-down" size={16} color={theme.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => setShowYearPicker(true)}
              style={[styles.datePickerButton, styles.datePickerButtonSmall, { backgroundColor: theme.backgroundDefault, borderColor: theme.cardBorder }]}
            >
              <ThemedText style={styles.datePickerText}>{startDate.getFullYear()}</ThemedText>
              <Feather name="chevron-down" size={16} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.label}>Active Days</ThemedText>
          <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
            Choose which days this habit applies to
          </ThemedText>
          
          <View style={styles.presetRow}>
            {PRESET_OPTIONS.filter(p => p.days !== null).map((preset) => (
              <Pressable
                key={preset.label}
                onPress={() => handlePresetSelect(preset)}
                style={[
                  styles.presetButton,
                  { 
                    backgroundColor: selectedPreset === preset.label ? theme.primary : theme.backgroundDefault,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <ThemedText style={[
                  styles.presetText,
                  { color: selectedPreset === preset.label ? "#FFFFFF" : theme.text },
                ]}>
                  {preset.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.daysRow}>
            {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayButton,
                  { 
                    backgroundColor: activeDays.includes(day) ? theme.primary : theme.backgroundDefault,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <ThemedText style={[
                  styles.dayText,
                  { color: activeDays.includes(day) ? "#FFFFFF" : theme.text },
                ]}>
                  {DAY_SHORT_NAMES[day]}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View
            style={[
              styles.settingRow,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Reminders</ThemedText>
              <ThemedText style={[styles.settingHint, { color: theme.textSecondary }]}>
                Get notified on active days
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.backgroundSecondary, true: theme.primary }}
              thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
              ios_backgroundColor={theme.backgroundSecondary}
            />
          </View>
        </View>

        <AnimatedPressable
          onPress={handleSave}
          onPressIn={() => {
            saveScale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
          }}
          onPressOut={() => {
            saveScale.value = withSpring(1, { damping: 15, stiffness: 200 });
          }}
          disabled={!isValid || isSaving}
          style={[
            styles.saveButton,
            { backgroundColor: isValid ? theme.primary : theme.neutral },
            saveAnimatedStyle,
          ]}
        >
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Habit"}
          </ThemedText>
        </AnimatedPressable>

        {isEditing ? (
          <AnimatedPressable
            onPress={handleDelete}
            onPressIn={() => {
              deleteScale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
            }}
            onPressOut={() => {
              deleteScale.value = withSpring(1, { damping: 15, stiffness: 200 });
            }}
            style={[
              styles.deleteButton,
              { backgroundColor: theme.backgroundDefault },
              deleteAnimatedStyle,
            ]}
          >
            <ThemedText style={[styles.deleteButtonText, { color: theme.failure }]}>
              Delete Habit
            </ThemedText>
          </AnimatedPressable>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      <DatePickerModal
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        onSelect={handleMonthChange}
        options={monthOptions}
        title="Select Month"
        theme={theme}
      />

      <DatePickerModal
        visible={showDayPicker}
        onClose={() => setShowDayPicker(false)}
        onSelect={handleDayChange}
        options={dayOptions}
        title="Select Day"
        theme={theme}
      />

      <DatePickerModal
        visible={showYearPicker}
        onClose={() => setShowYearPicker(false)}
        onSelect={handleYearChange}
        options={yearOptions}
        title="Select Year"
        theme={theme}
      />
    </ThemedView>
  );
}

function arraysEqual(a: DayOfWeek[], b: readonly DayOfWeek[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.habitName,
  },
  headerSpacer: {
    width: 60,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    width: 60,
  },
  cancelText: {
    ...Typography.body,
    fontWeight: "500",
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.habitName,
    marginBottom: Spacing.xs,
  },
  hint: {
    ...Typography.small,
    marginBottom: Spacing.md,
  },
  input: {
    ...Typography.body,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    height: Spacing.inputHeight,
  },
  datePickerRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    flex: 1,
    gap: Spacing.sm,
  },
  datePickerButtonSmall: {
    flex: 0,
    minWidth: 70,
  },
  datePickerText: {
    ...Typography.body,
  },
  presetRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  presetButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  presetText: {
    ...Typography.small,
    fontWeight: "500",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  dayText: {
    ...Typography.small,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
  },
  settingHint: {
    ...Typography.small,
    marginTop: Spacing.xs,
  },
  saveButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  saveButtonText: {
    ...Typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deleteButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    ...Typography.body,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxHeight: 400,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.habitName,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalList: {
    maxHeight: 300,
  },
  modalOption: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalOptionText: {
    ...Typography.body,
    textAlign: "center",
  },
});
