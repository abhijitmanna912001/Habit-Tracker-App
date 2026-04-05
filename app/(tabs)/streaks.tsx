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
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export interface StreakData {
  streak: number;
  bestStreak: number;
  total: number;
}

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
  const { user } = useAuth();

  // Fetch Habits
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

  // Fetch Habit Completions
  const fetchCompletions = useCallback(async () => {
    if (!user) return;

    try {
      const response = await databases.listDocuments({
        databaseId: DB_ID!,
        collectionId: COMPLETION_COLLECTION_ID!,
        queries: [Query.equal("user_id", user.$id)],
      });

      setCompletedHabits(response.documents as unknown as HabitCompletion[]);
    } catch (error) {
      console.error("Failed to fetch completions:", error);
    }
  }, [user]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

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
          fetchCompletions();
        }
      },
    );

    fetchHabits();
    fetchCompletions();

    return () => {
      habitsSubscription();
      completionsSubscription();
    };
  }, [user, fetchHabits, fetchCompletions]);

  // Calculate streaks
  const getStreakData = useCallback(
    (habitId: string): StreakData => {
      const habitCompletions = completedHabits
        .filter((c) => c.habit_id === habitId)
        .sort(
          (a, b) => Date.parse(a.completed_at) - Date.parse(b.completed_at),
        );

      if (habitCompletions.length === 0) {
        return { streak: 0, bestStreak: 0, total: 0 };
      }

      let streak = 0;
      let bestStreak = 0;
      const total = habitCompletions.length;

      let lastDate: number | null = null;
      let currentStreak = 0;

      for (const completion of habitCompletions) {
        const date = new Date(completion.completed_at).setHours(0, 0, 0, 0);

        if (lastDate === null) {
          currentStreak = 1;
        } else {
          const diffDays = (date - lastDate) / 86400000;

          if (diffDays === 1) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }
        }

        bestStreak = Math.max(bestStreak, currentStreak);
        streak = currentStreak;
        lastDate = date;
      }

      return { streak, bestStreak, total };
    },
    [completedHabits],
  );

  // Rank habits by best streak
  const rankedHabits = useMemo(() => {
    const habitStreaks = habits.map((habit) => {
      const { streak, bestStreak, total } = getStreakData(habit.$id);
      return { habit, streak, bestStreak, total };
    });

    return [...habitStreaks].sort((a, b) => b.bestStreak - a.bestStreak);
  }, [habits, getStreakData]);

  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];

  return (
    <View style={styles.container}>
      <Text style={styles.title} variant="headlineSmall">
        Habit Streaks
      </Text>

      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🏅 Top Streaks</Text>

          {rankedHabits.slice(0, 3).map((item, index) => (
            <View key={item.habit.$id} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[index]]}>
                <Text style={styles.rankingBadgeText}>{index + 1}</Text>
              </View>

              <Text style={styles.rankingHabit}>{item.habit.title}</Text>
              <Text style={styles.rankingStreak}>{item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}

      {rankedHabits.length === 0 ? (
        <View>
          <Text>No habits yet. Add your first habit!</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.container}
        >
          {rankedHabits.map(({ habit, streak, bestStreak, total }, index) => (
            <Card
              key={habit.$id}
              style={[styles.card, index === 0 && styles.firstCard]}
            >
              <Card.Content>
                <Text variant="titleMedium" style={styles.habitTitle}>
                  {habit.title}
                </Text>

                <Text style={styles.habitDesc}>{habit.description}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>🔥 {streak}</Text>
                    <Text style={styles.statLabel}>Current</Text>
                  </View>

                  <View style={styles.statBadgeGold}>
                    <Text style={styles.statBadgeText}>🏆 {bestStreak}</Text>
                    <Text style={styles.statLabel}>Best</Text>
                  </View>

                  <View style={styles.statBadgeGreen}>
                    <Text style={styles.statBadgeText}>✅ {total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  habitTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  habitDesc: { color: "#6c6c80", marginBottom: 8 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#7c4dff",
  },
  statBadgeGold: {
    backgroundColor: "#fffde7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeGreen: {
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  statBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
    fontWeight: "500",
  },

  rankingContainer: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#7c4dff",
    letterSpacing: 0.5,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  badge1: { backgroundColor: "#ffd700" }, // gold
  badge2: { backgroundColor: "#c0c0c0" }, // silver
  badge3: { backgroundColor: "#cd7f32" }, // bronze

  rankingBadgeText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },

  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  rankingStreak: {
    fontSize: 14,
    color: "#7c4dff",
    fontWeight: "bold",
  },
});
