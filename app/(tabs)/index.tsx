import {
  client,
  COLLECTION_ID,
  COMPLETION_COLLECTION_ID,
  databases,
  DB_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/db.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const swipeableRefs = useRef<
    Record<string, React.RefObject<SwipeableMethods | null>>
  >({});

  const isHabitCompleted = useCallback(
    (habitId: string) => completedHabits.includes(habitId),
    [completedHabits],
  );

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

  const fetchTodayCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const response = await databases.listDocuments({
        databaseId: DB_ID!,
        collectionId: COMPLETION_COLLECTION_ID!,
        queries: [
          Query.equal("user_id", user.$id),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ],
      });

      const completions = response.documents as unknown as HabitCompletion[];

      setCompletedHabits(completions.map((c) => c.habit_id));
    } catch (error) {
      console.error("Failed to fetch today's completions:", error);
    }
  }, [user]);

  useEffect(() => {
    const habitsChannel = `databases.${DB_ID}.collections.${COLLECTION_ID}.documents`;
    const completionsChannel = `databases.${DB_ID}.collections.${COMPLETION_COLLECTION_ID}.documents`;

    const habitsSubscription = client.subscribe(
      habitsChannel,
      (response: RealtimeResponse) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create",
          ) ||
          response.events.includes(
            "databases.*.collections.*.documents.*.update",
          ) ||
          response.events.includes(
            "databases.*.collections.*.documents.*.delete",
          )
        ) {
          fetchHabits();
          fetchTodayCompletions();
        }
      },
    );

    const completionsSubscription = client.subscribe(
      completionsChannel,
      (response: RealtimeResponse) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create",
          )
        ) {
          fetchTodayCompletions();
        }
      },
    );

    fetchHabits();
    fetchTodayCompletions();

    return () => {
      habitsSubscription();
      completionsSubscription();
    };
  }, [fetchHabits, fetchTodayCompletions]);

  const handleCompleteHabit = useCallback(
    async (id: string) => {
      if (!user || completedHabits.includes(id)) return;

      try {
        const currentDate = new Date().toISOString();

        await databases.createDocument({
          databaseId: DB_ID!,
          collectionId: COMPLETION_COLLECTION_ID!,
          documentId: ID.unique(),
          data: {
            habit_id: id,
            user_id: user.$id,
            completed_at: currentDate,
          },
        });

        const habit = habits.find((h) => h.$id === id);
        if (!habit) return;

        await databases.updateDocument({
          databaseId: DB_ID!,
          collectionId: COLLECTION_ID!,
          documentId: id,
          data: {
            streak_count: habit.streak_count + 1,
            last_completed: currentDate,
          },
        });
      } catch (error) {
        console.error("Failed to complete habit:", error);
      }
    },
    [user, habits, completedHabits],
  );

  const handleDeleteHabit = useCallback(async (id: string) => {
    try {
      await databases.deleteDocument({
        databaseId: DB_ID!,
        collectionId: COLLECTION_ID!,
        documentId: id,
      });
    } catch (error) {
      console.error("Failed to delete habit:", error);
    }
  }, []);

  const renderLeftActions = useCallback(
    () => (
      <View style={styles.swipeActionLeft}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={32}
          color="#fff"
        />
      </View>
    ),
    [],
  );

  const renderRightActions = useCallback(
    (habitId: string) => (
      <View style={styles.swipeActionRight}>
        {isHabitCompleted(habitId) ? (
          <Text style={{ color: "#fff" }}>Completed!</Text>
        ) : (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={32}
            color="#fff"
          />
        )}
      </View>
    ),
    [isHabitCompleted],
  );

  const renderHabits =
    habits.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          No habits yet. Add your first habit!
        </Text>
      </View>
    ) : (
      habits.map((habit) => {
        if (!swipeableRefs.current[habit.$id]) {
          swipeableRefs.current[habit.$id] =
            React.createRef<SwipeableMethods>();
        }

        return (
          <ReanimatedSwipeable
            key={habit.$id}
            ref={swipeableRefs.current[habit.$id]}
            overshootLeft={false}
            overshootRight={false}
            renderLeftActions={renderLeftActions}
            renderRightActions={() => renderRightActions(habit.$id)}
            onSwipeableOpen={(direction) => {
              if (direction === "left") {
                handleDeleteHabit(habit.$id);
              } else if (direction === "right") {
                handleCompleteHabit(habit.$id);
              }

              swipeableRefs.current[habit.$id]?.current?.close();
            }}
          >
            <Surface
              style={[
                styles.card,
                isHabitCompleted(habit.$id) && styles.cardCompleted,
              ]}
              elevation={0}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{habit.title}</Text>
                <Text style={styles.cardDescription}>{habit.description}</Text>

                <View style={styles.cardFooter}>
                  <View style={styles.streakBadge}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={18}
                      color="#ff9800"
                    />
                    <Text style={styles.streakText}>
                      {habit.streak_count} day streak
                    </Text>
                  </View>

                  <View style={styles.frequencyBadge}>
                    <Text style={styles.frequencyText}>
                      {habit.frequency.charAt(0).toUpperCase() +
                        habit.frequency.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>
          </ReanimatedSwipeable>
        );
      })
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today&apos;s Habits
        </Text>

        <Button mode="text" onPress={signOut} icon="logout">
          Sign Out
        </Button>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHabits}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontWeight: "bold",
  },

  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.08)",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  cardContent: {
    padding: 20,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b",
  },

  cardDescription: {
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },

  frequencyBadge: {
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyStateText: {
    color: "#666666",
  },

  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },

  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
  cardCompleted: {
    opacity: 0.4,
  },
});
