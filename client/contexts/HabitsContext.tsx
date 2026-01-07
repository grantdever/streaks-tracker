import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Habit, UserSettings, DayEntry, DEFAULT_SETTINGS, DayOfWeek, ALL_DAYS } from "@/types/habit";
import { StorageService } from "@/services/StorageService";

interface HabitsContextType {
  habits: Habit[];
  settings: UserSettings;
  isLoading: boolean;
  addHabit: (name: string, activeDays?: DayOfWeek[], startDate?: string) => Promise<Habit>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  updateDayEntry: (habitId: string, entry: DayEntry) => Promise<void>;
  removeDayEntry: (habitId: string, date: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  getHabitById: (habitId: string) => Habit | undefined;
  getSortedHabits: () => Habit[];
  refreshData: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await StorageService.loadAppData();
      setHabits(data.habits);
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const addHabit = useCallback(async (name: string, activeDays: DayOfWeek[] = ALL_DAYS, startDate?: string): Promise<Habit> => {
    const today = formatDate(new Date());
    const newHabit: Habit = {
      id: generateId(),
      name: name.trim(),
      createdAt: today,
      startDate: startDate || today,
      entries: {},
      activeDays,
    };
    
    await StorageService.addHabit(newHabit);
    setHabits((prev) => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback(async (habitId: string, updates: Partial<Habit>) => {
    await StorageService.updateHabit(habitId, updates);
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h))
    );
  }, []);

  const deleteHabit = useCallback(async (habitId: string) => {
    await StorageService.deleteHabit(habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  }, []);

  const updateDayEntry = useCallback(async (habitId: string, entry: DayEntry) => {
    await StorageService.updateDayEntry(habitId, entry);
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            entries: { ...h.entries, [entry.date]: entry },
          };
        }
        return h;
      })
    );
  }, []);

  const removeDayEntry = useCallback(async (habitId: string, date: string) => {
    await StorageService.removeDayEntry(habitId, date);
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newEntries = { ...h.entries };
          delete newEntries[date];
          return { ...h, entries: newEntries };
        }
        return h;
      })
    );
  }, []);

  const updateSettingsHandler = useCallback(async (newSettings: Partial<UserSettings>) => {
    await StorageService.updateSettings(newSettings);
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const getHabitById = useCallback(
    (habitId: string) => habits.find((h) => h.id === habitId),
    [habits]
  );

  const getSortedHabits = useCallback(() => {
    return [...habits].sort((a, b) => a.name.localeCompare(b.name));
  }, [habits]);

  const value: HabitsContextType = {
    habits,
    settings,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    updateDayEntry,
    removeDayEntry,
    updateSettings: updateSettingsHandler,
    getHabitById,
    getSortedHabits,
    refreshData,
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits(): HabitsContextType {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
