import { COLLECTION_ID, databases, DB_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/db.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Query } from "react-native-appwrite";
import { Button, Text } from "react-native-paper";

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
      <View>
        <Text variant="headlineSmall">Today&apos;s Habits</Text>
        <Button mode="text" onPress={signOut} icon={"logout"}>
          Sign Out
        </Button>
      </View>

      {habits?.length === 0 ? (
        <View>
          <Text>No habits yet. Add your first habit!</Text>
        </View>
      ) : (
        habits?.map((habit) => (
          <View key={habit.$id}>
            <Text>{habit.title}</Text>
            <Text>{habit.description}</Text>
            <View>
              <View>
                <MaterialCommunityIcons
                  name="fire"
                  size={18}
                  color={"#ff9800"}
                />
                <Text>{habit.streak_count} day streak</Text>
              </View>
              <View>
                <Text>
                  {habit.frequency.charAt(0).toUpperCase() +
                    habit.frequency.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
