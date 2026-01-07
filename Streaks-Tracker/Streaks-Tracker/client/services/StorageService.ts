import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppData, Habit, UserSettings, DEFAULT_SETTINGS, DayEntry, ALL_DAYS } from "@/types/habit";

const STORAGE_KEY = "streaks_app_data";

const getDefaultAppData = (): AppData => ({
  habits: [],
  settings: DEFAULT_SETTINGS,
});

const migrateHabit = (habit: any): Habit => {
  return {
    ...habit,
    startDate: habit.startDate || habit.createdAt,
    activeDays: habit.activeDays || ALL_DAYS,
    notifications: habit.notifications || undefined,
  };
};

export const StorageService = {
  async loadAppData(): Promise<AppData> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        const data = JSON.parse(jsonValue);
        const habits = (data.habits || []).map(migrateHabit);
        return {
          habits,
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
        };
      }
      return getDefaultAppData();
    } catch (error) {
      console.error("Error loading app data:", error);
      return getDefaultAppData();
    }
  },

  async saveAppData(data: AppData): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error("Error saving app data:", error);
      throw error;
    }
  },

  async addHabit(habit: Habit): Promise<void> {
    const data = await this.loadAppData();
    data.habits.push(habit);
    await this.saveAppData(data);
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    const data = await this.loadAppData();
    const index = data.habits.findIndex((h) => h.id === habitId);
    if (index !== -1) {
      data.habits[index] = { ...data.habits[index], ...updates };
      await this.saveAppData(data);
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    const data = await this.loadAppData();
    data.habits = data.habits.filter((h) => h.id !== habitId);
    await this.saveAppData(data);
  },

  async updateDayEntry(habitId: string, entry: DayEntry): Promise<void> {
    const data = await this.loadAppData();
    const habit = data.habits.find((h) => h.id === habitId);
    if (habit) {
      habit.entries[entry.date] = entry;
      await this.saveAppData(data);
    }
  },

  async removeDayEntry(habitId: string, date: string): Promise<void> {
    const data = await this.loadAppData();
    const habit = data.habits.find((h) => h.id === habitId);
    if (habit && habit.entries[date]) {
      delete habit.entries[date];
      await this.saveAppData(data);
    }
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    const data = await this.loadAppData();
    data.settings = { ...data.settings, ...settings };
    await this.saveAppData(data);
  },

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    }
  },
};
