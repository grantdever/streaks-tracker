import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderButton } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

import DashboardScreen from "@/screens/DashboardScreen";
import InfiniteGridScreen from "@/screens/InfiniteGridScreen";
import DayDetailScreen from "@/screens/DayDetailScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import AddHabitScreen from "@/screens/AddHabitScreen";
import HeaderTitle from "@/components/HeaderTitle";

export type RootStackParamList = {
  Dashboard: undefined;
  InfiniteGrid: { habitId: string };
  DayDetail: { habitId: string; date: string };
  Settings: undefined;
  AddHabit: { habitId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle />,
          headerRight: () => (
            <HeaderButton
              onPress={() => navigation.navigate("Settings")}
              accessibilityLabel="Settings"
            >
              <Feather name="settings" size={22} color={theme.text} />
            </HeaderButton>
          ),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="InfiniteGrid"
        component={InfiniteGridScreen}
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DayDetail"
        component={DayDetailScreen}
        options={{
          presentation: "formSheet",
          headerTitle: "Day Details",
        }}
      />
      <Stack.Screen
        name="AddHabit"
        component={AddHabitScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
