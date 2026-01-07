export type DayState = "success" | "failure" | "exemption" | "blank";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_SHORT_NAMES: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export interface NotificationSettings {
  enabled: boolean;
  time: string;
}

export interface DayEntry {
  date: string;
  state: DayState;
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
  startDate: string;
  entries: Record<string, DayEntry>;
  activeDays: DayOfWeek[];
  notifications?: NotificationSettings;
}

export interface UserSettings {
  displayName: string;
  avatarIndex: number;
  hapticsEnabled: boolean;
}

export interface AppData {
  habits: Habit[];
  settings: UserSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: "",
  avatarIndex: 0,
  hapticsEnabled: true,
};

export const ALL_DAYS: DayOfWeek[] = [0, 1, 2, 3, 4, 5, 6];
export const WEEKDAYS: DayOfWeek[] = [1, 2, 3, 4, 5];
export const WEEKENDS: DayOfWeek[] = [0, 6];
