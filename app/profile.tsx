import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopNavbar from "@/src/components/TopNavbar";

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

useEffect(() => {
  // If no user in auth context, redirect to login
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
  console.log( "this is user :",user)

  if (!user) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <TopNavbar title="Profile" onProfilePress={() => {}} 
          logoSource={{
    uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
  }}
        />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user.profile?.url }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7}>
              <Ionicons name="camera" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.username}>@{user.userName}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Downloads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
        </View>

  

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* About Us Button */}
        <TouchableOpacity
          style={styles.aboutButton}
          onPress={handleAboutPress}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={20} color={Colors.textPrimary} />
          <Text style={styles.aboutText}>About Us</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  showArrow = true,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  showArrow?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={22} color={Colors.textPrimary} />
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      )}
    </TouchableOpacity>
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
    paddingTop: 24,
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginBottom: 32,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  menuSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: "#ef4444",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ef4444",
  },
  aboutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  aboutText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  version: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
});