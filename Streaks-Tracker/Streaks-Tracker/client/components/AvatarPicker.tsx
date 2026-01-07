import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AvatarPickerProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  hapticsEnabled: boolean;
}

const AVATAR_CONFIGS = [
  { icon: "target", bgColor: "#007AFF" },
  { icon: "zap", bgColor: "#00FF41" },
  { icon: "star", bgColor: "#FF9500" },
  { icon: "heart", bgColor: "#FF3B30" },
  { icon: "sun", bgColor: "#FFD60A" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AvatarItemProps {
  config: { icon: string; bgColor: string };
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  hapticsEnabled: boolean;
}

function AvatarItem({ config, index, isSelected, onSelect, hapticsEnabled }: AvatarItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelect();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }}
      style={[
        styles.avatarItem,
        { backgroundColor: config.bgColor },
        isSelected && { borderWidth: 3, borderColor: theme.text },
        animatedStyle,
      ]}
    >
      <Feather name={config.icon as any} size={32} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

export function AvatarPicker({ selectedIndex, onSelect, hapticsEnabled }: AvatarPickerProps) {
  return (
    <View style={styles.container}>
      {AVATAR_CONFIGS.map((config, index) => (
        <AvatarItem
          key={index}
          config={config}
          index={index}
          isSelected={selectedIndex === index}
          onSelect={() => onSelect(index)}
          hapticsEnabled={hapticsEnabled}
        />
      ))}
    </View>
  );
}

export function getAvatarConfig(index: number) {
  return AVATAR_CONFIGS[index] || AVATAR_CONFIGS[0];
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  avatarItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
