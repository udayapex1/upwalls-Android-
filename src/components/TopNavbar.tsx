import { Colors } from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TopNavbarProps = {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  logoSource?: any;
  onPressLogo?: () => void;
};

export default function TopNavbar({
  title,
  subtitle,
  showLogo = true,
  logoSource,
  onPressLogo,
}: TopNavbarProps) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, refreshUser } = useAuth();

  // Debug: Log user data changes
  useEffect(() => {
    console.log("TopNavbar - User updated:", {
      hasUser: !!user,
      userName: user?.userName,
      profileUrl: user?.profile?.url,
      photoUrl: user?.photo?.url,
    });
  }, [user]);

  // Refresh user data when component mounts if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshUser();
    }
  }, []);

  const handleProfilePress = () => {
    if (isAuthenticated && user) {
      router.push("/profile");
    } else {
      router.push("/(auth)/login");
    }
  };
  


  return (
    <View
      style={[
        styles.container,
        {
          paddingTop:
            insets.top ||
            (Platform.OS === "android" ? StatusBar.currentHeight : 0),
        },
      ]}
    >
      <View style={styles.content}>
        {/* Brand */}
        <View style={styles.brandContainer}>
          {showLogo && (
            <View style={styles.logoContainer}>
              {logoSource ? (
                onPressLogo ? (
                  <TouchableOpacity onPress={onPressLogo} activeOpacity={0.7}>
                    <Image source={logoSource} style={styles.logo} />
                  </TouchableOpacity>
                ) : (
                  <Image source={logoSource} style={styles.logo} />
                )
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={Colors.accent}
                  />
                </View>
              )}
            </View>
          )}

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              {/* <Text style={styles.companyName}>UpWalls</Text> */}
              <Text style={styles.separator}>|</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>

        {/* Profile / Login */}
        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.profileButton}
          activeOpacity={0.7}
        >
          {user ? (
            <>
              {(user.profile?.url || user.photo?.url) ? (
                <Image
                  source={{ uri: user.profile?.url.replace("http://", "https://") || user.photo?.url.replace("http://", "https://") }}
                  style={styles.avatar}
                  onError={(error) => {
                    console.error("TopNavbar image load error:", error);
                  }}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.username}>
                    {user.userName?.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={Colors.textPrimary}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    marginRight:-30,
    marginLeft : -20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.accent + '15',
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  companyName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
  },
  separator: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },

});