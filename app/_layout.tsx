import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Redirect, Stack, useSegments } from "expo-router";

function RouteHandler() {
  const segments = useSegments();
  const { user, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return null;
  }

  const inAuthScreen = segments[0] === "auth";

  if (!user && !inAuthScreen) {
    return <Redirect href="/auth" />;
  }

  if (user && inAuthScreen) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteHandler />
    </AuthProvider>
  );
}
