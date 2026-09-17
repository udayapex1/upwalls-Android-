import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { BACKEND_URL } from "@/src/services/auth";
import { resolveImageUrl } from "@/src/utils/imageUrl";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const leaderboardLogo = {
  uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
};

interface LeaderboardUser { _id: string; userName: string; profile?: { url: string; public_id: string }; postCount: number; }
const FALLBACK_AVATAR = "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png";
const pointsFor = (uploads: number) => uploads * 50;

export default function Leaderboard() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("allTime");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/users/getUsers`);
        const incoming = response.data.users || response.data;
        if (Array.isArray(incoming)) setUsers(incoming.filter((user) => user.postCount > 0).sort((a, b) => b.postCount - a.postCount).slice(0, 10));
      } catch (error) { console.error("Error fetching leaderboard:", error); } finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  const avatarFor = (user: LeaderboardUser) => user.profile?.url ? resolveImageUrl(user.profile.url) : FALLBACK_AVATAR;
  const Avatar = ({ user, size = 52 }: { user: LeaderboardUser; size?: number }) => <Image source={{ uri: avatarFor(user) }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  const champion = users[0];
  const podium = users.slice(1, 3);
  const renderRow = ({ item, index }: { item: LeaderboardUser; index: number }) => index < 3 ? null : (
    <View style={styles.row}>
      <Text style={styles.rank}>{String(index + 1).padStart(2, "0")}</Text><Avatar user={item} />
      <View style={styles.rowCopy}><Text style={styles.rowName} numberOfLines={1}>{item.userName || "User"}</Text><Text style={styles.rowMeta}>{item.postCount} uploads</Text></View>
      <View style={styles.points}><Text style={styles.pointsNumber}>{pointsFor(item.postCount).toLocaleString()}</Text><Text style={styles.pointsLabel}>PTS</Text></View>
    </View>
  );

  return <View style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.background} /><TopNavbar title="Leaderboard" logoSource={leaderboardLogo} />
    <View style={styles.tabs}>{[{ key: "weekly", label: "This week" }, { key: "monthly", label: "This month" }, { key: "allTime", label: "All time" }].map((tab) => <TouchableOpacity key={tab.key} onPress={() => setPeriod(tab.key as typeof period)} style={[styles.tab, period === tab.key && styles.activeTab]} activeOpacity={0.8}><Text style={[styles.tabText, period === tab.key && styles.activeTabText]}>{tab.label}</Text></TouchableOpacity>)}</View>
    {loading ? <View style={styles.loading}><ActivityIndicator size="large" color={Colors.accent} /></View> : <FlatList data={users} renderItem={renderRow} keyExtractor={(item) => item._id} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} ListHeaderComponent={champion ? <>
      <LinearGradient colors={["#172554", "#2563eb"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTopline}><View style={styles.eyebrow}><Ionicons name="trophy" size={14} color="#fbbf24" /><Text style={styles.eyebrowText}>TOP CONTRIBUTOR</Text></View><Text style={styles.heroPeriod}>{period === "allTime" ? "ALL TIME" : period === "weekly" ? "THIS WEEK" : "THIS MONTH"}</Text></View>
        <View style={styles.championAvatarWrap}><View style={styles.avatarRing}><Avatar user={champion} size={88} /></View><View style={styles.crown}><Ionicons name="trophy" size={16} color="#172554" /></View></View>
        <Text style={styles.championName}>{champion.userName || "User"}</Text><Text style={styles.championCaption}>Leading the wallpaper community</Text>
        <View style={styles.heroStats}><View><Text style={styles.heroStatValue}>{champion.postCount}</Text><Text style={styles.heroStatLabel}>UPLOADS</Text></View><View style={styles.heroStatDivider} /><View><Text style={styles.heroStatValue}>{pointsFor(champion.postCount).toLocaleString()}</Text><Text style={styles.heroStatLabel}>POINTS</Text></View></View>
      </LinearGradient>
      {podium.length > 0 && <View style={styles.podium}>{podium.map((user, i) => <View key={user._id} style={styles.podiumCard}><View style={[styles.podiumBadge, i === 0 && styles.silverBadge]}><Text style={styles.podiumBadgeText}>{i + 2}</Text></View><Avatar user={user} size={58} /><Text style={styles.podiumName} numberOfLines={1}>{user.userName || "User"}</Text><Text style={styles.podiumPoints}>{pointsFor(user.postCount).toLocaleString()} pts</Text></View>)}</View>}
      {users.length > 3 && <Text style={styles.sectionTitle}>More creators</Text>}
    </> : <View style={styles.empty}><Ionicons name="podium-outline" size={42} color={Colors.textSecondary} /><Text style={styles.emptyTitle}>No rankings yet</Text><Text style={styles.emptyText}>Be the first to upload a wallpaper.</Text></View>} />}
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" }, tabs: { flexDirection: "row", margin: 18, padding: 4, backgroundColor: "#eaf0f7", borderRadius: 14 }, tab: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 11 }, activeTab: { backgroundColor: Colors.surface, shadowColor: "#0f172a", shadowOpacity: 0.08, shadowRadius: 7, elevation: 2 }, tabText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary }, activeTabText: { color: Colors.textPrimary },
  hero: { minHeight: 330, borderRadius: 28, padding: 22, alignItems: "center", overflow: "hidden", marginHorizontal: 18, shadowColor: "#1d4ed8", shadowOpacity: 0.22, shadowRadius: 16, elevation: 6 }, heroTopline: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, eyebrow: { flexDirection: "row", alignItems: "center", gap: 6 }, eyebrowText: { color: "#bfdbfe", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, heroPeriod: { color: "#bfdbfe", fontSize: 10, fontWeight: "700", letterSpacing: 1 }, championAvatarWrap: { marginTop: 25, marginBottom: 12, position: "relative" }, avatarRing: { padding: 5, borderRadius: 54, backgroundColor: "#fbbf24" }, crown: { position: "absolute", bottom: -3, right: -4, backgroundColor: "#fbbf24", width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#1e40af" }, championName: { color: "white", fontSize: 25, fontWeight: "800", letterSpacing: -0.5 }, championCaption: { color: "#bfdbfe", fontSize: 12, marginTop: 5 }, heroStats: { flexDirection: "row", alignItems: "center", gap: 28, marginTop: 25 }, heroStatValue: { color: "white", fontSize: 24, fontWeight: "800", textAlign: "center" }, heroStatLabel: { color: "#bfdbfe", fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 3, textAlign: "center" }, heroStatDivider: { height: 36, width: 1, backgroundColor: "#93c5fd", opacity: 0.45 },
  podium: { flexDirection: "row", gap: 12, marginHorizontal: 18, marginTop: 14 }, podiumCard: { flex: 1, alignItems: "center", backgroundColor: "white", borderRadius: 20, padding: 15, borderWidth: 1, borderColor: "#e7edf4" }, podiumBadge: { position: "absolute", top: 11, right: 11, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fbbf24" }, silverBadge: { backgroundColor: "#cbd5e1" }, podiumBadgeText: { fontSize: 12, color: "#172554", fontWeight: "900" }, podiumName: { color: Colors.textPrimary, fontSize: 14, fontWeight: "700", marginTop: 10, maxWidth: "100%" }, podiumPoints: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 }, sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "800", marginHorizontal: 18, marginTop: 26, marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e8eef5" }, rank: { color: Colors.textSecondary, width: 31, fontSize: 13, fontWeight: "800" }, rowCopy: { flex: 1, marginLeft: 13 }, rowName: { color: Colors.textPrimary, fontSize: 15, fontWeight: "700" }, rowMeta: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 }, points: { alignItems: "flex-end" }, pointsNumber: { color: Colors.textPrimary, fontSize: 15, fontWeight: "800" }, pointsLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 1, marginTop: 2 }, loading: { flex: 1, alignItems: "center", justifyContent: "center" }, empty: { alignItems: "center", marginTop: 90, paddingHorizontal: 30 }, emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: "800", marginTop: 14 }, emptyText: { color: Colors.textSecondary, marginTop: 6 },
});
