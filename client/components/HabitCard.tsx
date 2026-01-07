import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { MiniChain } from "@/components/MiniChain";
import { useTheme } from "@/hooks/useTheme";
import { useHabits } from "@/contexts/HabitsContext";
import { Habit } from "@/types/habit";
import { getSevenDayHistory, useStreakEngine } from "@/hooks/useStreakEngine";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";

interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HabitCard({ habit, onPress, onLongPress }: HabitCardProps) {
  const { theme } = useTheme();
  const { settings } = useHabits();
  const scale = useSharedValue(1);
  const streakInfo = useStreakEngine(habit);
  const sevenDayHistory = getSevenDayHistory(habit);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleLongPress = () => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress?.();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={400}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        Shadows.card,
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftContent}>
          <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
          <ThemedText style={[styles.streakText, { color: theme.textSecondary }]}>
            {streakInfo.currentStreak} day streak
          </ThemedText>
        </View>
        <MiniChain entries={sevenDayHistory} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  habitName: {
    ...Typography.habitName,
  },
  streakText: {
    ...Typography.small,
    marginTop: Spacing.xs,
  },
});
