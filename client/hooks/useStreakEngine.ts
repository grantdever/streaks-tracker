import { useMemo } from "react";
import { Habit, DayEntry, DayState, DayOfWeek } from "@/types/habit";

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalSuccess: number;
  totalFailure: number;
  totalExemption: number;
}

const getDayOfWeek = (dateStr: string): DayOfWeek => {
  const date = new Date(dateStr + "T00:00:00");
  return date.getDay() as DayOfWeek;
};

const isActiveDay = (habit: Habit, dateStr: string): boolean => {
  if (!habit.activeDays || habit.activeDays.length === 0) return true;
  const dayOfWeek = getDayOfWeek(dateStr);
  return habit.activeDays.includes(dayOfWeek);
};

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const parseDate = (dateStr: string): Date => {
  return new Date(dateStr + "T00:00:00");
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isToday = (dateStr: string): boolean => {
  return formatDate(new Date()) === dateStr;
};

const isFuture = (dateStr: string): boolean => {
  const today = formatDate(new Date());
  return dateStr > today;
};

const isPast = (dateStr: string): boolean => {
  const today = formatDate(new Date());
  return dateStr < today;
};

const getEntryState = (habit: Habit, dateStr: string): DayState => {
  const entry = habit.entries[dateStr];
  return entry?.state || "blank";
};

export function useStreakEngine(habit: Habit | null): StreakInfo {
  return useMemo(() => {
    if (!habit) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalSuccess: 0,
        totalFailure: 0,
        totalExemption: 0,
      };
    }

    const entries = Object.values(habit.entries);
    let totalSuccess = 0;
    let totalFailure = 0;
    let totalExemption = 0;

    entries.forEach((entry) => {
      if (entry.state === "success") totalSuccess++;
      else if (entry.state === "failure") totalFailure++;
      else if (entry.state === "exemption") totalExemption++;
    });

    const today = new Date();
    const todayStr = formatDate(today);
    const startDate = parseDate(habit.startDate || habit.createdAt);
    const activeDays = habit.activeDays ?? [];
    const activeDaysSet = new Set(activeDays);
    const hasActiveDaysRestriction = activeDays.length > 0 && activeDays.length < 7;

    let longestStreak = 0;
    let tempStreak = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateStr = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay() as DayOfWeek;
      
      if (hasActiveDaysRestriction && !activeDaysSet.has(dayOfWeek)) {
        currentDate = addDays(currentDate, 1);
        continue;
      }
      
      const state = getEntryState(habit, dateStr);

      if (state === "success") {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (state === "failure") {
        tempStreak = 0;
      } else if (state === "exemption") {
      } else if (state === "blank") {
        tempStreak = 0;
      }
      
      currentDate = addDays(currentDate, 1);
    }

    let currentStreak = 0;
    currentDate = new Date(today);
    
    while (currentDate >= startDate) {
      const dateStr = formatDate(currentDate);
      const dayOfWeek = currentDate.getDay() as DayOfWeek;
      
      if (hasActiveDaysRestriction && !activeDaysSet.has(dayOfWeek)) {
        currentDate = addDays(currentDate, -1);
        continue;
      }
      
      const state = getEntryState(habit, dateStr);
      
      if (state === "success") {
        currentStreak++;
      } else if (state === "exemption") {
      } else if (state === "failure") {
        break;
      } else if (state === "blank") {
        if (dateStr === todayStr) {
        } else {
          break;
        }
      }
      
      currentDate = addDays(currentDate, -1);
    }

    return {
      currentStreak,
      longestStreak,
      totalSuccess,
      totalFailure,
      totalExemption,
    };
  }, [habit]);
}

export function canSetExemption(dateStr: string): boolean {
  const targetDate = parseDate(dateStr);
  const now = new Date();
  const tomorrow = addDays(now, 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return targetDate >= tomorrow;
}

export function cycleDayState(currentState: DayState): DayState {
  switch (currentState) {
    case "blank":
      return "success";
    case "success":
      return "failure";
    case "failure":
      return "blank";
    case "exemption":
      return "exemption";
    default:
      return "blank";
  }
}

export function getSevenDayHistory(habit: Habit): DayEntry[] {
  const today = new Date();
  const result: DayEntry[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);
    const dateStr = formatDate(date);
    const entry = habit.entries[dateStr];
    result.push({
      date: dateStr,
      state: entry?.state || "blank",
      notes: entry?.notes,
    });
  }
  
  return result;
}

export { formatDate, parseDate, addDays, isToday, isFuture, isPast };
