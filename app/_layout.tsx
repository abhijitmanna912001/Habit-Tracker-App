import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Redirect, Stack, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider>
          <SafeAreaProvider>
            <RouteHandler />
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
