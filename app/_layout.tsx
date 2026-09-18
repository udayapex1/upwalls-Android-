import { AuthProvider } from "@/src/context/AuthContext";
import { WallpapersProvider } from "@/src/context/WallpapersContext";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import { useEffect } from "react";
import { QUOTE_REFRESH_TASK } from "@/src/tasks/quoteRefreshTask";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "android") {
      BackgroundFetch.registerTaskAsync(QUOTE_REFRESH_TASK, {
        minimumInterval: 4 * 60 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      }).catch((error) => console.warn("Quote task registration failed:", error));
    }
  }, []);

  return (
    <AuthProvider>
      <WallpapersProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </WallpapersProvider>
    </AuthProvider>
  );
}
