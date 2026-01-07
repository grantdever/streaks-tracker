import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Switch,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useHabits } from "@/contexts/HabitsContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

export default function SettingsScreen() {
  const { settings, updateSettings } = useHabits();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [displayName, setDisplayName] = useState(settings.displayName);

  const handleNameBlur = useCallback(async () => {
    if (displayName !== settings.displayName) {
      await updateSettings({ displayName: displayName.trim() });
    }
  }, [displayName, settings.displayName, updateSettings]);

  const handleToggleHaptics = useCallback(async (value: boolean) => {
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateSettings({ hapticsEnabled: value });
  }, [updateSettings]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText style={styles.inputLabel}>Display Name</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
              onBlur={handleNameBlur}
              returnKeyType="done"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
          <View
            style={[
              styles.settingRow,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.settingTextContainer}>
              <ThemedText style={styles.settingLabel}>Haptic Feedback</ThemedText>
              <ThemedText style={[styles.settingHint, { color: theme.textSecondary }]}>
                Feel gentle vibrations when interacting
              </ThemedText>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: theme.backgroundSecondary, true: theme.primary }}
              thumbColor={Platform.OS === "ios" ? undefined : "#FFFFFF"}
              ios_backgroundColor={theme.backgroundSecondary}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
            Streaks v1.0.0
          </ThemedText>
          <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
            Build lasting habits, one day at a time
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.habitName,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
  },
  inputLabel: {
    ...Typography.small,
    marginBottom: Spacing.xs,
  },
  input: {
    ...Typography.body,
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
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
  footer: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
    paddingTop: Spacing.xl,
  },
  footerText: {
    ...Typography.small,
    marginBottom: Spacing.xs,
  },
});
