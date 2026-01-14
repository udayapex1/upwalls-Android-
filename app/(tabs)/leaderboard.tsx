import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { BACKEND_URL } from "@/src/services/auth";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

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
      const response = await axios.get(`${BACKEND_URL}/api/users/getUsers`);
      const users = response.data.users || response.data;
      
      if (Array.isArray(users)) {
        const filteredUsers = users
          .filter((user: any) => user.postCount > 0)
          .sort((a: any, b: any) => b.postCount - a.postCount)
          .slice(0, 4);
        setLeaderboardData(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const safeProfileUrl = leaderboardData.map(user => 
    user.profile?.url.replace(/^(http:\/\/|https:\/\/)/, 'https://')
  );

  const renderTopUser = () => {
    if (!leaderboardData[0]) return null;
    const user = leaderboardData[0];
    
    return (
      <View style={styles.topUserContainer}>
        {/* Large Avatar with layered circles */}
        <View style={styles.avatarStack}>
          <View style={styles.avatarCircle3} />
          <View style={styles.avatarCircle2} />
          <View style={styles.avatarCircle1}>
            <Image 
              source={{ 
                uri: safeProfileUrl[0] || 
                  "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png" 
              }} 
              style={styles.topUserAvatar}
            />
          </View>
          <View style={styles.numberOne}>
            <Text style={styles.numberOneText}>1</Text>
          </View>
        </View>

        <Text style={styles.topUserName}>{user.userName}</Text>
        
        {/* Minimalist stats */}
        <View style={styles.topUserStats}>
          <View style={styles.topStatItem}>
            <Text style={styles.topStatNumber}>{user.postCount}</Text>
            <Text style={styles.topStatLabel}>uploads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.topStatItem}>
            <Text style={styles.topStatNumber}>{(user.postCount * 50).toLocaleString()}</Text>
            <Text style={styles.topStatLabel}>points</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSecondThird = () => {
    if (leaderboardData.length < 2) return null;
    
    return (
      <View style={styles.secondThirdContainer}>
        {[1, 2].map((idx) => {
          if (!leaderboardData[idx]) return null;
          const user = leaderboardData[idx];
          
          return (
            <View key={user._id} style={styles.smallCard}>
              <View style={styles.smallCardTop}>
                <View style={styles.smallRank}>
                  <Text style={styles.smallRankText}>{idx + 1}</Text>
                </View>
              </View>

              <View style={styles.smallAvatarContainer}>
                <Image 
                  source={{ 
                    uri: safeProfileUrl[idx] || 
                      "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png" 
                  }} 
                  style={styles.smallAvatar}
                />
              </View>

              <Text style={styles.smallName} numberOfLines={1}>
                {user.userName}
              </Text>

              <View style={styles.smallStats}>
                <Text style={styles.smallStatsText}>
                  {user.postCount} · {(user.postCount * 50).toLocaleString()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    if (index < 3) return null;
    const rank = index + 1;

    return (
      <View style={styles.listRow}>
        <Text style={styles.rowRank}>{rank}</Text>
        
        <Image 
          source={{ 
            uri: safeProfileUrl[index] || 
              "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png" 
          }} 
          style={styles.rowAvatar}
        />
         
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{item.userName || "User"}</Text>
          <Text style={styles.rowStats}>
            {item.postCount} uploads
          </Text>
        </View>
        
        <Text style={styles.rowPoints}>
          {(item.postCount * 50).toLocaleString()}
        </Text>
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

      {/* Minimal tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: "weekly", label: "Week" },
          { key: "monthly", label: "Month" },
          { key: "allTime", label: "All Time" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setPeriod(tab.key as any)}
            activeOpacity={0.6}
          >
            <Text style={[
              styles.tabText,
              period === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </Text>
            {period === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
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
            <>
              {renderTopUser()}
              {renderSecondThird()}
              {leaderboardData.length > 3 && (
                <View style={styles.divider} />
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyCircle} />
              <Text style={styles.emptyTitle}>No Rankings</Text>
              <Text style={styles.emptyText}>Be the first</Text>
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
  },

  // Minimal Tabs
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    gap: 24,
  },
  tab: {
    paddingVertical: 8,
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondary,
    letterSpacing: -0.2,
  },
  tabTextActive: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 1,
  },

  // Top User - Hero Section
  topUserContainer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 40,
  },
  avatarStack: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  avatarCircle3: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.3,
  },
  avatarCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  avatarCircle1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    overflow: "hidden",
  },
  topUserAvatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  numberOne: {
    position: "absolute",
    bottom: -4,
    backgroundColor: Colors.textPrimary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  numberOneText: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.background,
  },
  topUserName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.8,
  },
  topUserStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  topStatItem: {
    alignItems: "center",
  },
  topStatNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 4,
  },
  topStatLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },

  // Second and Third
  secondThirdContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  smallCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallCardTop: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  smallRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallRankText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  smallAvatarContainer: {
    marginBottom: 12,
  },
  smallAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  smallName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  smallStats: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallStatsText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },

  // List Rows
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowRank: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    width: 32,
    marginRight: 12,
  },
  rowAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  rowStats: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  rowPoints: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
});