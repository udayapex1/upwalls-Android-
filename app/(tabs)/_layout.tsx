import { Colors } from "@/src/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          height: 60,
        },
        tabBarActiveTintColor: Colors.textPrimary, // ✅ fixed
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 6,
        },
      }}
    >
      {/* EXPLORE */}
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size} color={color} />
          ),
        }}
      />

     

      {/* CATEGORIES */}
      <Tabs.Screen
        name="categories"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />

      {/* TRENDING */}
      <Tabs.Screen
        name="trending"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />

       {/* FEED */}
      <Tabs.Screen
        name="feed"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size} color={color} />
          ),
        }}
      />   

      {/*Leaderboard*/}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="podium-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
