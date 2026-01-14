import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { BACKEND_URL } from "@/src/services/auth";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LeaderboardUser {
  _id: string;
  userName: string;
  email: string;
  profile?: {
    url: string;
    public_id: string;
  };
  postCount: number;
}

export default function Leaderboard() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("allTime");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      console.log("Fetching leaderboard data...");
      const response = await axios.get(`${BACKEND_URL}/api/users/getUsers`);
      
      const users = response.data.users || response.data;
      
      if (Array.isArray(users)) {
        // Filter users with postCount > 0 and sort by postCount descending
        const filteredUsers = users
          .filter((user: any) => user.postCount > 0)
          .sort((a: any, b: any) => b.postCount - a.postCount)
          .slice(0, 4); // Only take top 4

        console.log("Filtered top 4 users:", filteredUsers);
        setLeaderboardData(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const rank = index + 1;
    let rankColor = Colors.textPrimary;
    let iconName: any = "medal";
    
    if (rank === 1) {
      rankColor = "#FFD700"; // Gold
      iconName = "trophy";
    } else if (rank === 2) {
      rankColor = "#C0C0C0"; // Silver
      iconName = "medal";
    } else if (rank === 3) {
      rankColor = "#CD7F32"; // Bronze
      iconName = "medal";
    }

    return (
      <View style={[
        styles.rankItem,
        rank === 1 && styles.rankItemFirst,
      ]}>
        <View style={styles.rankNumberContainer}>
          {rank <= 3 ? (
            <Ionicons name={iconName} size={28} color={rankColor} />
          ) : (
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>{rank}</Text>
            </View>
          )}
        </View>
        
        <Image 
          source={{ 
            uri: item.profile?.url || "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png" 
          }} 
          style={[
            styles.avatar,
            rank === 1 && styles.avatarFirst,
          ]} 
        />
        
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.userName || "User"}</Text>
          <View style={styles.statsRow}>
            <Ionicons name="images" size={14} color={Colors.textSecondary} />
            <Text style={styles.uploadsText}>{item.postCount} uploads</Text>
          </View>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>{(item.postCount * 50).toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <TopNavbar
        title="Leaderboard"
        logoSource={{
          uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
        }}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, period === "weekly" && styles.filterTabActive]}
          onPress={() => setPeriod("weekly")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, period === "weekly" && styles.filterTextActive]}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, period === "monthly" && styles.filterTabActive]}
          onPress={() => setPeriod("monthly")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, period === "monthly" && styles.filterTextActive]}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, period === "allTime" && styles.filterTabActive]}
          onPress={() => setPeriod("allTime")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, period === "allTime" && styles.filterTextActive]}>All Time</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
          <Text style={styles.loadingText}>Loading top creators...</Text>
        </View>
      ) : (
        <FlatList
          data={leaderboardData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerComponent}>
              <View style={styles.crownContainer}>
                <Ionicons name="trophy" size={56} color="#FFD700" />
              </View>
              <Text style={styles.leaderboardTitle}>Top 4 Creators</Text>
              <Text style={styles.leaderboardSubtitle}>
                {leaderboardData.length} active contributor{leaderboardData.length !== 1 ? 's' : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No active creators yet</Text>
              <Text style={styles.emptyText}>Be the first to upload wallpapers!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerComponent: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  crownContainer: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  leaderboardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: Colors.textPrimary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.background,
  },
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rankItemFirst: {
    borderWidth: 2,
    borderColor: "#FFD700",
    backgroundColor: Colors.surface,
  },
  rankNumberContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.border,
  },
  avatarFirst: {
    borderColor: "#FFD700",
    borderWidth: 3,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  uploadsText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  pointsContainer: {
    alignItems: "flex-end",
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  points: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});