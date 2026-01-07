import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { DayState } from "@/types/habit";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { isFuture, isToday } from "@/hooks/useStreakEngine";

interface CalendarCellProps {
  date: string;
  dayNumber: number;
  state: DayState;
  onTap: () => void;
  onLongPress: () => void;
  hapticsEnabled: boolean;
  isActiveDay?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CalendarCell({
  date,
  dayNumber,
  state,
  onTap,
  onLongPress,
  hapticsEnabled,
  isActiveDay = true,
}: CalendarCellProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const isFutureDate = isFuture(date);
  const isTodayDate = isToday(date);
  const isInactive = !isActiveDay;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    if (isInactive) {
      return theme.neutralInactive;
    }
    if (isFutureDate) {
      if (state === "exemption") {
        return theme.exemption;
      }
      return theme.neutralLight;
    }
    switch (state) {
      case "success":
        return theme.success;
      case "failure":
        return theme.failure;
      case "exemption":
        return theme.exemption;
      default:
        return theme.backgroundDefault;
    }
  };

  const getIcon = () => {
    switch (state) {
      case "success":
        return "check";
      case "failure":
        return "x";
      case "exemption":
        return "alert-circle";
      default:
        return null;
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    if (!isFutureDate && isActiveDay) {
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onTap();
    }
  };

  const handleLongPress = () => {
    if (!isActiveDay) return;
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress();
  };

  const backgroundColor = getBackgroundColor();
  const icon = getIcon();
  const isBlank = state === "blank" && !isFutureDate;
  const hasIcon = icon !== null;
  const iconColor = "#FFFFFF";
  const iconSize = 28;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={400}
      style={[
        styles.cell,
        { backgroundColor },
        isBlank && { borderWidth: 1, borderColor: theme.cardBorder },
        isTodayDate && { borderWidth: 2, borderColor: theme.primary },
        animatedStyle,
      ]}
    >
      <ThemedText
        style={[
          styles.dayNumber,
          hasIcon && { color: iconColor },
          (isFutureDate || isInactive) && { color: theme.textSecondary },
        ]}
      >
        {dayNumber}
      </ThemedText>
      {hasIcon ? (
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={iconSize} color={iconColor} strokeWidth={3} />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: Spacing.cellSize,
    height: Spacing.cellSize,
    borderRadius: BorderRadius.xs,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dayNumber: {
    ...Typography.dayNumber,
    position: "absolute",
    top: 4,
    left: 6,
  },
  iconContainer: {
    marginTop: 8,
  },
});
