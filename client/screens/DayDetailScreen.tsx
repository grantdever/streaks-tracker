import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Switch,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useHabits } from "@/contexts/HabitsContext";
import { useTheme } from "@/hooks/useTheme";
import { canSetExemption, isFuture } from "@/hooks/useStreakEngine";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

type DayDetailRouteProp = RouteProp<RootStackParamList, "DayDetail">;
type DayDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, "DayDetail">;

export default function DayDetailScreen() {
  const navigation = useNavigation<DayDetailNavigationProp>();
  const route = useRoute<DayDetailRouteProp>();
  const { habitId, date } = route.params;
  const { getHabitById, updateDayEntry, removeDayEntry, settings } = useHabits();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const habit = getHabitById(habitId);
  const entry = habit?.entries[date];

  const [notes, setNotes] = useState("");
  const [isExemption, setIsExemption] = useState(false);
  const [showExemptionError, setShowExemptionError] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(entry?.notes || "");
    setIsExemption(entry?.state === "exemption");
    setHasChanges(false);
  }, [entry?.notes, entry?.state, date]);

  const dateObj = new Date(date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isFutureDate = isFuture(date);
  const canExempt = canSetExemption(date);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: formattedDate,
    });
  }, [navigation, formattedDate]);

  const handleNotesChange = useCallback((text: string) => {
    setNotes(text);
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!habit || !hasChanges) return;

    setIsSaving(true);

    try {
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const currentState = isExemption ? "exemption" : (entry?.state || "blank");
      const trimmedNotes = notes.trim();

      if (!trimmedNotes && currentState === "blank" && !entry) {
        setIsSaving(false);
        setHasChanges(false);
        return;
      }

      if (!trimmedNotes && currentState === "blank" && entry) {
        await removeDayEntry(habit.id, date);
      } else {
        await updateDayEntry(habit.id, {
          date,
          state: currentState,
          notes: trimmedNotes || undefined,
        });
      }

      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, [habit, hasChanges, notes, isExemption, entry, date, updateDayEntry, removeDayEntry, settings.hapticsEnabled]);

  const handleToggleExemption = useCallback(async (value: boolean) => {
    if (!habit) return;

    if (value && !canExempt) {
      setShowExemptionError(true);
      if (settings.hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    setShowExemptionError(false);
    setIsExemption(value);

    if (settings.hapticsEnabled) {
      if (value) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }

    try {
      const trimmedNotes = notes.trim();
      
      if (!value && !trimmedNotes) {
        await removeDayEntry(habit.id, date);
      } else {
        await updateDayEntry(habit.id, {
          date,
          state: value ? "exemption" : "blank",
          notes: trimmedNotes || undefined,
        });
      }
    } catch (error) {
      console.error("Failed to toggle exemption:", error);
      setIsExemption(!value);
    }
  }, [habit, date, notes, canExempt, settings.hapticsEnabled, updateDayEntry, removeDayEntry]);

  if (!habit) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Habit not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.cardBorder,
              },
            ]}
            placeholder="Add notes for this day..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={handleNotesChange}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          
          {hasChanges ? (
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={[
                styles.saveButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save Notes"}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        {isFutureDate ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Exemption</ThemedText>
            <View
              style={[
                styles.exemptionRow,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <View style={styles.exemptionTextContainer}>
                <ThemedText style={styles.exemptionLabel}>
                  Mark as exemption
                </ThemedText>
                <ThemedText
                  style={[styles.exemptionHint, { color: theme.textSecondary }]}
                >
                  Exemptions preserve your streak without counting as a success
                </ThemedText>
              </View>
              <Switch
                value={isExemption}
                onValueChange={handleToggleExemption}
                trackColor={{ false: theme.backgroundSecondary, true: theme.exemption }}
                thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
                ios_backgroundColor={theme.backgroundSecondary}
              />
            </View>

            {showExemptionError ? (
              <View style={styles.errorContainer}>
                <ThemedText style={[styles.errorText, { color: theme.failure }]}>
                  You can only create exemptions 24+ hours before a date. You will rebuild your streak stronger than ever.
                </ThemedText>
              </View>
            ) : null}

            {!canExempt && !showExemptionError ? (
              <View style={styles.hintContainer}>
                <ThemedText style={[styles.hintText, { color: theme.textSecondary }]}>
                  Exemptions can only be set for dates more than 24 hours in the future.
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.hintContainer}>
            <ThemedText style={[styles.hintText, { color: theme.textSecondary }]}>
              Tap the day on the calendar to mark it as complete or incomplete.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.habitName,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    ...Typography.notes,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 120,
  },
  saveButton: {
    marginTop: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    ...Typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  exemptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  exemptionTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  exemptionLabel: {
    ...Typography.body,
  },
  exemptionHint: {
    ...Typography.small,
    marginTop: Spacing.xs,
  },
  errorContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: BorderRadius.xs,
  },
  errorText: {
    ...Typography.caption,
  },
  hintContainer: {
    marginTop: Spacing.sm,
  },
  hintText: {
    ...Typography.caption,
  },
});
