import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";
import { useWallpapers } from "@/src/context/WallpapersContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { userWallpapers } = useWallpapers();

  // Mock stats for now, real stats would come from an API
  // Points calculation: 1 wallpaper = 25 points
  const contributionScore = userWallpapers.length * 25;

  /* 
   * Quick Actions updated to use consistent theme colors.
   * "Irrelevant" colors removed. Icons now use Colors.textPrimary.
   * "No out color" interpreted as no background color for the icon container.
   */
  const quickActions = [
    {
      id: "upload",
      title: "Upload New",
      icon: "cloud-upload-outline",
      route: "/(profileAction)/upload", // Updated route
    },
    {
      id: "profile",
      title: "Edit Profile",
      icon: "person-outline",
      route: "/profile/edit", // Placeholder route
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: "bar-chart-outline",
      route: "/analytics", // Placeholder
    },
    {
      id: "settings",
      title: "Settings",
      icon: "settings-outline",
      route: "/settings", // Placeholder
    },
  ];

  const handleActionPress = (route: string) => {
    // Handle navigation - replace with your router logic
    console.log("Navigating to", route);
    Example: router.push(route);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <TopNavbar
      
        logoSource={{
    uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
  }}
      title="Dashboard" showLogo={true} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username} numberOfLines={1}>
            {user?.userName || "Creator"}
          </Text>
          <Text style={styles.subtitle}>Here's your creative overview</Text>
        </View>

        {/* Stats Grid (Bento Style) */}
        <View style={styles.statsGrid}>
          {/* Main Stat - Uploads */}
          <TouchableOpacity
          onPress={() => handleActionPress("/myUploads")}
          style={[styles.statCard, styles.mainStatCard]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="images" size={24} color="#FFF" />
            </View>
            <Text style={styles.statValueMain} numberOfLines={1}>
              {userWallpapers.length}
            </Text>
            <Text style={styles.statLabelMain}>Total Uploads</Text>
          </TouchableOpacity>

          {/* Right Column Stats */}
          <View style={styles.rightStatsColumn}>
            <View style={[styles.statCard, styles.secondaryStatCard]}>
              <Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />
              <Text style={styles.statValue} numberOfLines={1}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </Text>
              <Text style={styles.statLabel}>Member Since</Text>
            </View>
            <View style={[styles.statCard, styles.secondaryStatCard]}>
              <Ionicons name="trophy-outline" size={20} color="#F59E0B" />
              <Text style={styles.statValue} numberOfLines={1}>
                {contributionScore.toLocaleString()}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.statLabel}>Contribution Score</Text>
                <TouchableOpacity 
                  onPress={() => Alert.alert("How it works", "Your contribution score is calculated based on your activity:\n\n• 1 Wallpaper Upload = 25 Points")}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} style={{ marginLeft: 4, marginTop: 2 }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity / Performance */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceChange}>+12.5%</Text>
                <Text style={styles.performanceLabel}>vs last week</Text>
              </View>
              <View style={styles.graphPlaceholder}>
                <Ionicons name="trending-up" size={48} color={Colors.accent + "40"} />
              </View>
            </View>
          </View>
        </View> */}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {/* Row 1: Upload (Large) + Profile (Small) */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionCard, { flex: 1.5 }]}
                activeOpacity={0.7}
                onPress={() => handleActionPress(quickActions[0].route)}
              >
                <View style={[styles.actionIcon]}>
                  <Ionicons name={quickActions[0].icon as any} size={28} color={Colors.textPrimary} />
                </View>
                <Text style={styles.actionTitle} numberOfLines={1}>
                  {quickActions[0].title}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { flex: 1 }]}
                activeOpacity={0.7}
                onPress={() => handleActionPress(quickActions[1].route)}
              >
                <View style={[styles.actionIcon]}>
                  <Ionicons name={quickActions[1].icon as any} size={24} color={Colors.textPrimary} />
                </View>
                <Text style={styles.actionTitle} numberOfLines={1}>
                  {quickActions[1].title}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row 2: Analytics (Small) + Settings (Large) */}
            <View style={styles.actionRow}>
               <TouchableOpacity
                style={[styles.actionCard, { flex: 1 }]}
                activeOpacity={0.7}
                onPress={() => handleActionPress(quickActions[2].route)}
              >
                <View style={[styles.actionIcon]}>
                  <Ionicons name={quickActions[2].icon as any} size={24} color={Colors.textPrimary} />
                </View>
                <Text style={styles.actionTitle} numberOfLines={1}>
                  {quickActions[2].title}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { flex: 1.5 }]}
                activeOpacity={0.7}
                onPress={() => handleActionPress(quickActions[3].route)}
              >
                <View style={[styles.actionIcon]}>
                  <Ionicons name={quickActions[3].icon as any} size={24} color={Colors.textPrimary} />
                </View>
                <Text style={styles.actionTitle} numberOfLines={1}>
                  {quickActions[3].title}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  username: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    height: 180,
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  rightStatsColumn: {
    flex: 1,
    gap: 12,
  },
  secondaryStatCard: {
    flex: 1,
    alignItems: "flex-start",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statValueMain: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 12,
  },
  statLabelMain: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  performanceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  performanceItem: {
    justifyContent: "center",
  },
  performanceChange: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10B981",
  },
  performanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  graphPlaceholder: {
    opacity: 0.5,
  },
  actionsGrid: {
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    height: 130, // Taller cards
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
});