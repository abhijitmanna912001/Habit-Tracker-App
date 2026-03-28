import { COLLECTION_ID, databases, DB_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/db.types";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();

  const fetchHabits = useCallback(async () => {
    if (!user) return;

    try {
      const response = await databases.listDocuments({
        databaseId: DB_ID!,
        collectionId: COLLECTION_ID!,
        queries: [Query.equal("user_id", user.$id)],
      });

      setHabits(response.documents as unknown as Habit[]);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  return (
    <View>
      <Text>Home Screen</Text>
      <Button mode="text" onPress={signOut} icon={"logout"}>
        Sign Out
      </Button>
    </View>
  );
}
