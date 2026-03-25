import { useAuth } from "@/lib/auth-context";
import { View, Text } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
  const { signOut } = useAuth();

  return (
    <View>
      <Text>Home Screen</Text>
      <Button mode="text" onPress={signOut} icon={"logout"}>
        Sign Out
      </Button>
    </View>
  );
}
