import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DayEntry } from "@/types/habit";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface MiniChainProps {
  entries: DayEntry[];
}

export function MiniChain({ entries }: MiniChainProps) {
  const { theme } = useTheme();

  const getStateColor = (state: string) => {
    switch (state) {
      case "success":
        return theme.success;
      case "failure":
        return theme.failure;
      case "exemption":
        return theme.exemption;
      default:
        return theme.backgroundSecondary;
    }
  };

  const getStateIcon = (state: string) => {
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

  return (
    <View style={styles.container}>
      {entries.map((entry, index) => {
        const backgroundColor = getStateColor(entry.state);
        const icon = getStateIcon(entry.state);
        const isBlank = entry.state === "blank";

        return (
          <View
            key={entry.date || index}
            style={[
              styles.cell,
              { backgroundColor },
              isBlank && { borderWidth: 1, borderColor: theme.cardBorder },
            ]}
          >
            {icon ? (
              <Feather name={icon as any} size={12} color="#FFFFFF" />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.miniChainGap,
  },
  cell: {
    width: Spacing.miniChainSize,
    height: Spacing.miniChainSize,
    borderRadius: BorderRadius.xs / 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
