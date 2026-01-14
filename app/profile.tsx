import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";
import { useWallpapers } from "@/src/context/WallpapersContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";

import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type UserData = {
  _id: string;
  email: string;
  userName: string;
  photo?: {
    public_id: string;
    url: string;
  };
};

export default function Profile() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { userWallpapers, isLoading, refreshUserWallpapers } = useWallpapers();

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
    router.replace("/(auth)/login");
  };

  const handleAboutPress = () => {
    router.push("/about");
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
  };

  console.log("this is user :", user);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <TopNavbar
        title="Profile"
        logoSource={{
          uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          {/* Avatar and Stats Row */}
          <View style={styles.topRow}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarContainer}>
                <Image source={{ uri: user.profile?.url }} style={styles.avatar} />
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userWallpapers.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <Text style={styles.displayName}>{user.userName}</Text>
            <Text>showing profile url for debugging</Text>
            <Text>{user.profile?.url}</Text>
            <Text style={styles.bio}>
              Wallpaper enthusiast 🎨{"\n"}
              Curating beautiful backgrounds{"\n"}
              ✨ {user.email}
            </Text>
          </View>
         {/* commented due to not required at this time  */}
          {/* Action Buttons */}
          {/* <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.editProfileText}>Edit profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareProfileButton}
              activeOpacity={0.7}
            >
              <Text style={styles.shareProfileText}>Share profile</Text>
            </TouchableOpacity>
          
          </View> */}
        </View>

    

        {/* Tab Bar */}
        {/* <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="grid-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="heart-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="bookmark-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View> */}

        {/* Grid Placeholder */}
        {/* <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="image-outline" size={48} color={Colors.textSecondary} />
            </View>
          </View>
        </View> */}

        {/* Settings Menu */}
        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push("/myUploads")}
            activeOpacity={0.6}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="images-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>My Uploads | {userWallpapers.length}</Text> 
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.menuItem} activeOpacity={0.6}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.menuItem} activeOpacity={0.6}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="time-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>Your activity</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity> */}

          {/* <TouchableOpacity style={styles.menuItem} activeOpacity={0.6}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="bookmark-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>Saved</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity> */}

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push("/policy")}
            activeOpacity={0.6}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push("/report")}
            activeOpacity={0.6}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="warning-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>Report Issue</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAboutPress}
            activeOpacity={0.6}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.textPrimary} />
              <Text style={styles.menuItemText}>About Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: 0,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarWrapper: {
    marginRight: 28,
  },
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    padding: 2,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "400",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  bioSection: {
    marginBottom: 16,
  },
  displayName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    fontWeight: "400",
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  editProfileButton: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  shareProfileButton: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  shareProfileText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  iconButton: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightsSection: {
    paddingVertical: 12,
    paddingLeft: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  highlightItem: {
    alignItems: "center",
    marginRight: 16,
  },
  highlightCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textPrimary,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  gridContainer: {
    paddingTop: 1,
  },
  gridRow: {
    flexDirection: "row",
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
  version: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
});