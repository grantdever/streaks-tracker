import { Platform } from "react-native";

const tintColorLight = "#007AFF";
const tintColorDark = "#0A84FF";

export const Colors = {
  light: {
    text: "#000000",
    textSecondary: "#8E8E93",
    buttonText: "#FFFFFF",
    tabIconDefault: "#8E8E93",
    tabIconSelected: tintColorLight,
    link: "#007AFF",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F9F9F9",
    backgroundSecondary: "#F2F2F2",
    backgroundTertiary: "#E6E6E6",
    primary: "#007AFF",
    success: "#00FF41",
    failure: "#FF3B30",
    exemption: "#FF9500",
    neutral: "#8E8E93",
    neutralLight: "rgba(142, 142, 147, 0.15)",
    neutralInactive: "rgba(142, 142, 147, 0.4)",
    border: "#E5E5E5",
    cardBorder: "#E0E0E0",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#8E8E93",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    link: "#0A84FF",
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3A3A3C",
    primary: "#0A84FF",
    success: "#00FF41",
    failure: "#FF3B30",
    exemption: "#FF9500",
    neutral: "#8E8E93",
    neutralLight: "rgba(142, 142, 147, 0.15)",
    neutralInactive: "rgba(142, 142, 147, 0.5)",
    border: "#38383A",
    cardBorder: "#48484A",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
  cellSize: 60,
  cellGap: 8,
  miniChainSize: 24,
  miniChainGap: 4,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  notes: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fab: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
};
