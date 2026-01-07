import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, Typography, Fonts } from "@/constants/theme";

export default function HeaderTitle() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <ThemedText style={styles.title}>Streaks</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
    borderRadius: 6,
  },
  title: {
    ...Typography.h4,
    fontFamily: Fonts?.rounded,
  },
});
