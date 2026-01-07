import React, { useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { CalendarCell } from "@/components/CalendarCell";
import { useHabits } from "@/contexts/HabitsContext";
import { useTheme } from "@/hooks/useTheme";
import { useStreakEngine, cycleDayState, formatDate, addDays, isFuture } from "@/hooks/useStreakEngine";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, Typography } from "@/constants/theme";
import { DayState, Habit } from "@/types/habit";

type InfiniteGridRouteProp = RouteProp<RootStackParamList, "InfiniteGrid">;
type InfiniteGridNavigationProp = NativeStackNavigationProp<RootStackParamList, "InfiniteGrid">;

const SCREEN_WIDTH = Dimensions.get("window").width;
const CELL_SIZE = Spacing.cellSize;
const CELL_GAP = Spacing.cellGap;
const HORIZONTAL_PADDING = Spacing.lg;

function calculateStreakForHabit(habit: Habit): number {
  const today = new Date();
  const todayStr = formatDate(today);
  let streakCount = 0;
  let currentDate = new Date(today);
  const activeDays = habit.activeDays ?? [];
  const activeDaysSet = new Set(activeDays);
  const hasActiveDaysRestriction = activeDays.length > 0 && activeDays.length < 7;
  const startDate = new Date((habit.startDate || habit.createdAt) + "T00:00:00");

  while (currentDate >= startDate) {
    const dateStr = formatDate(currentDate);
    const dayOfWeek = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    
    if (hasActiveDaysRestriction && !activeDaysSet.has(dayOfWeek)) {
      currentDate = addDays(currentDate, -1);
      continue;
    }

    const entry = habit.entries[dateStr];
    const state = entry?.state || "blank";
    
    if (state === "success") {
      streakCount++;
    } else if (state === "exemption") {
    } else if (state === "failure") {
      break;
    } else if (state === "blank") {
      if (dateStr !== todayStr) {
        break;
      }
    }
    currentDate = addDays(currentDate, -1);
  }
  
  return streakCount;
}

interface HabitPageProps {
  habit: Habit;
  index: number;
  total: number;
  insets: { top: number; bottom: number };
  theme: any;
  settings: { hapticsEnabled: boolean };
  onClose: () => void;
  onEdit: (habitId: string) => void;
  onCellTap: (habitId: string, dateStr: string, currentState: DayState, isActiveDay: boolean) => void;
  onCellLongPress: (habitId: string, dateStr: string, isActiveDay: boolean) => void;
}

function HabitPage({
  habit,
  index,
  total,
  insets,
  theme,
  settings,
  onClose,
  onEdit,
  onCellTap,
  onCellLongPress,
}: HabitPageProps) {
  const streakInfo = useStreakEngine(habit);
  const closeScale = useSharedValue(1);
  const editScale = useSharedValue(1);

  const closeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeScale.value }],
  }));

  const editAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editScale.value }],
  }));

  const calendarData = useMemo(() => {
    const today = new Date();
    const habitStartDate = new Date((habit.startDate || habit.createdAt) + "T00:00:00");
    const endDate = addDays(today, 30);
    const activeDays = habit.activeDays ?? [];
    const activeDaysSet = new Set(activeDays);
    const hasActiveDaysRestriction = activeDays.length > 0 && activeDays.length < 7;
    
    const months: { monthLabel: string; days: { date: string; dayNumber: number; state: DayState; isActiveDay: boolean }[] }[] = [];
    let currentDate = new Date(habitStartDate);
    let currentMonth = "";
    let currentMonthDays: { date: string; dayNumber: number; state: DayState; isActiveDay: boolean }[] = [];

    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate);
      const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const dayOfWeek = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
      
      if (monthLabel !== currentMonth) {
        if (currentMonthDays.length > 0) {
          months.push({ monthLabel: currentMonth, days: currentMonthDays });
        }
        currentMonth = monthLabel;
        currentMonthDays = [];
      }

      const entry = habit.entries[dateStr];
      const isActiveDay = hasActiveDaysRestriction ? activeDaysSet.has(dayOfWeek) : true;
      currentMonthDays.push({
        date: dateStr,
        dayNumber: currentDate.getDate(),
        state: entry?.state || "blank",
        isActiveDay,
      });

      currentDate = addDays(currentDate, 1);
    }

    if (currentMonthDays.length > 0) {
      months.push({ monthLabel: currentMonth, days: currentMonthDays });
    }

    return months;
  }, [habit]);

  return (
    <View style={[styles.habitPage, { width: SCREEN_WIDTH }]}>
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <Animated.View style={closeAnimatedStyle}>
            <Pressable
              onPress={onClose}
              onPressIn={() => {
                closeScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
              }}
              onPressOut={() => {
                closeScale.value = withSpring(1, { damping: 15, stiffness: 200 });
              }}
              style={styles.headerButton}
            >
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </Animated.View>
          <View style={styles.headerCenter}>
            <ThemedText style={styles.habitName}>{habit.name}</ThemedText>
            <View style={styles.streakRow}>
              <ThemedText style={[styles.streakText, { color: theme.textSecondary }]}>
                {streakInfo.currentStreak} day streak
              </ThemedText>
              {total > 1 ? (
                <ThemedText style={[styles.habitIndicator, { color: theme.textSecondary }]}>
                  {index + 1}/{total}
                </ThemedText>
              ) : null}
            </View>
          </View>
          <Animated.View style={editAnimatedStyle}>
            <Pressable
              onPress={() => onEdit(habit.id)}
              onPressIn={() => {
                editScale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
              }}
              onPressOut={() => {
                editScale.value = withSpring(1, { damping: 15, stiffness: 200 });
              }}
              style={styles.headerButton}
            >
              <Feather name="edit-2" size={20} color={theme.text} />
            </Pressable>
          </Animated.View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {calendarData.map((month, monthIndex) => (
            <Animated.View
              key={month.monthLabel}
              entering={FadeIn.delay(monthIndex * 50)}
              style={styles.monthContainer}
            >
              <ThemedText style={styles.monthLabel}>{month.monthLabel}</ThemedText>
              <View style={styles.daysGrid}>
                {month.days.map((day) => (
                  <CalendarCell
                    key={day.date}
                    date={day.date}
                    dayNumber={day.dayNumber}
                    state={day.state}
                    onTap={() => onCellTap(habit.id, day.date, day.state, day.isActiveDay)}
                    onLongPress={() => onCellLongPress(habit.id, day.date, day.isActiveDay)}
                    hapticsEnabled={settings.hapticsEnabled}
                    isActiveDay={day.isActiveDay}
                  />
                ))}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </ThemedView>
    </View>
  );
}

export default function InfiniteGridScreen() {
  const navigation = useNavigation<InfiniteGridNavigationProp>();
  const route = useRoute<InfiniteGridRouteProp>();
  const { habitId } = route.params;
  const { habits, getHabitById, updateDayEntry, removeDayEntry, settings } = useHabits();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const habit = getHabitById(habitId);

  useEffect(() => {
    if (!habit || habits.length === 0) {
      navigation.goBack();
    }
  }, [habit, habits.length, navigation]);

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      const streakA = calculateStreakForHabit(a);
      const streakB = calculateStreakForHabit(b);
      return streakB - streakA;
    });
  }, [habits]);

  const initialIndex = useMemo(() => {
    const idx = sortedHabits.findIndex(h => h.id === habitId);
    return idx >= 0 ? idx : 0;
  }, [sortedHabits, habitId]);

  const handleClose = useCallback(() => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.goBack();
  }, [navigation, settings.hapticsEnabled]);

  const handleEdit = useCallback((hId: string) => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("AddHabit", { habitId: hId });
  }, [navigation, settings.hapticsEnabled]);

  const handleCellTap = useCallback(async (hId: string, dateStr: string, currentState: DayState, isActiveDay: boolean) => {
    if (isFuture(dateStr) || !isActiveDay) return;

    const newState = cycleDayState(currentState);
    
    if (newState === "blank") {
      await removeDayEntry(hId, dateStr);
    } else {
      await updateDayEntry(hId, {
        date: dateStr,
        state: newState,
      });
    }
  }, [updateDayEntry, removeDayEntry]);

  const handleCellLongPress = useCallback((hId: string, dateStr: string, isActiveDay: boolean) => {
    if (!isActiveDay) return;
    navigation.navigate("DayDetail", { habitId: hId, date: dateStr });
  }, [navigation]);

  const handleMomentumScrollEnd = useCallback(() => {
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings.hapticsEnabled]);

  const renderHabitPage = useCallback(({ item, index }: ListRenderItemInfo<Habit>) => (
    <HabitPage
      habit={item}
      index={index}
      total={sortedHabits.length}
      insets={insets}
      theme={theme}
      settings={settings}
      onClose={handleClose}
      onEdit={handleEdit}
      onCellTap={handleCellTap}
      onCellLongPress={handleCellLongPress}
    />
  ), [sortedHabits.length, insets, theme, settings, handleClose, handleEdit, handleCellTap, handleCellLongPress]);

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  }), []);

  if (!habit || habits.length === 0) {
    return null;
  }

  return (
    <FlatList
      ref={flatListRef}
      data={sortedHabits}
      renderItem={renderHabitPage}
      keyExtractor={keyExtractor}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={initialIndex}
      getItemLayout={getItemLayout}
      onMomentumScrollEnd={handleMomentumScrollEnd}
      decelerationRate="fast"
      snapToInterval={SCREEN_WIDTH}
      snapToAlignment="start"
      bounces={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  habitPage: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  habitName: {
    ...Typography.habitName,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  streakText: {
    ...Typography.small,
    marginTop: 2,
  },
  habitIndicator: {
    ...Typography.small,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: Spacing.lg,
  },
  monthContainer: {
    marginBottom: Spacing["2xl"],
  },
  monthLabel: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CELL_GAP,
  },
});
