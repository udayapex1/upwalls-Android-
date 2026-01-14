import { AuthProvider } from "@/src/context/AuthContext";
import { WallpapersProvider } from "@/src/context/WallpapersContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AuthProvider>
      <WallpapersProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </WallpapersProvider>
    </AuthProvider>
  );
}
