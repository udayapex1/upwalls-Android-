import { Stack } from "expo-router";
import { AuthProvider } from "@/src/context/AuthContext";
import { WallpapersProvider } from "@/src/context/WallpapersContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WallpapersProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </WallpapersProvider>
    </AuthProvider>
  );
}
