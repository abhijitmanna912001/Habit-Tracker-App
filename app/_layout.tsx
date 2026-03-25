import { AuthProvider } from "@/lib/auth-context";
import { Redirect, Stack, useSegments } from "expo-router";

const isAuth = false;

export default function RootLayout() {
  const segments = useSegments();

  const inAuthScreen = segments[0] === "auth";

  if (!isAuth && !inAuthScreen) {
    return <Redirect href="/auth" />;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
