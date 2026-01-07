import React, { useCallback } from "react";
import { FlatList, StyleSheet, ActivityIndicator, View, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { HabitCard } from "@/components/HabitCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { EmptyState } from "@/components/EmptyState";
import { useHabits } from "@/contexts/HabitsContext";
import { useTheme } from "@/hooks/useTheme";
import { Habit } from "@/types/habit";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing } from "@/constants/theme";

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { habits, isLoading, refreshData } = useHabits();
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleHabitPress = useCallback((habit: Habit) => {
    navigation.navigate("InfiniteGrid", { habitId: habit.id });
  }, [navigation]);

  const handleHabitLongPress = useCallback((habit: Habit) => {
    navigation.navigate("AddHabit", { habitId: habit.id });
  }, [navigation]);

  const handleAddHabit = useCallback(() => {
    navigation.navigate("AddHabit", {});
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Habit }) => (
    <HabitCard 
      habit={item} 
      onPress={() => handleHabitPress(item)} 
      onLongPress={() => handleHabitLongPress(item)}
    />
  ), [handleHabitPress, handleHabitLongPress]);

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {habits.length === 0 ? (
        <EmptyState
          icon="target"
          title="Start your first habit"
          message="Build lasting habits by tracking your daily progress. Tap the + button to get started."
        />
      ) : (
        <FlatList
          data={habits}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: headerHeight + Spacing.xl,
              paddingBottom: insets.bottom + Spacing.xl + 72,
            },
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              progressViewOffset={headerHeight}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      <FloatingActionButton
        onPress={handleAddHabit}
        bottomOffset={insets.bottom + Spacing.xl}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
  },
});
