import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { useWallpapers } from "@/src/context/WallpapersContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Responsive column calculation
const getNumColumns = () => {
  if (SCREEN_WIDTH >= 1024) return 4;
  if (SCREEN_WIDTH >= 768) return 3;
  if (SCREEN_WIDTH >= 414) return 2;
  return 2;
};

const getCardSize = () => {
  const numColumns = getNumColumns();
  const spacing = 10;
  const horizontalPadding = 16;
  const totalSpacing = (numColumns + 1) * spacing;
  const availableWidth = SCREEN_WIDTH - horizontalPadding * 2 - totalSpacing;
  return availableWidth / numColumns;
};

export default function MyUploads() {
  const [numColumns] = useState(getNumColumns());
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
  const insets = useSafeAreaInsets();
  const { userWallpapers, isLoading, refreshUserWallpapers, deleteWallpaper } = useWallpapers();
  const cardSize = getCardSize();
  const cardHeight = cardSize * 1.5;

  // Refresh user wallpapers when component mounts
  useEffect(() => {
    refreshUserWallpapers();
  }, []);

  const handleImageLoadStart = (id: string) => {
    setImageLoading((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageLoadEnd = (id: string) => {
    setImageLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Wallpaper",
      "Are you sure you want to delete this wallpaper?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
             const success = await deleteWallpaper(id);
             if (success) {
               Alert.alert("Success", "Wallpaper deleted successfully");
               console.log("Deleted wallpaper", id);
             } else {
               Alert.alert("Error", "Failed to delete wallpaper");
             }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <TopNavbar
        title="My Uploads"
        logoSource={{
          uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
        }}
      />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Your Collection</Text>
          <Text style={styles.headerSubtitle}>
            {userWallpapers.length} {userWallpapers.length === 1 ? "wallpaper" : "wallpapers"} shared
          </Text>
        </View>
      </View>

      {/* Loading State */}
      {isLoading && userWallpapers.length === 0 ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
          <Text style={styles.loadingText}>Loading your uploads...</Text>
        </View>
      ) : (
        /* Wallpaper Grid */
        <FlatList
          data={userWallpapers}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          key={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: insets.bottom + 100 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cloud-upload-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>You haven't uploaded any wallpapers yet</Text>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => router.push("/(tabs)/upload")}
              >
                <Text style={styles.uploadButtonText}>Upload Now</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { width: cardSize, height: cardHeight }]}
              activeOpacity={0.85}
              onPress={() => {
                const wallpaperItem = item as any;
                const imageUrl = wallpaperItem.wallpaperImage?.url || 
                                wallpaperItem.image?.url || 
                                wallpaperItem.url || "";
                router.push({
                  pathname: "/wallpapers/[id]",
                  params: {
                    id: item._id,
                    uri: imageUrl,
                  },
                });
              }}
            >
              <View style={styles.imageContainer}>
                {imageLoading[item._id] && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.textSecondary} />
                  </View>
                )}
                {(() => {
                  const wallpaperItem = item as any;
                  
                  const imageUrl = wallpaperItem.wallpaperImage?.url || 
                                  wallpaperItem.image?.url || 
                                  wallpaperItem.image?.secure_url ||
                                  wallpaperItem.imageUrl || 
                                  wallpaperItem.url || 
                                  wallpaperItem.photo?.url ||
                                  wallpaperItem.photoUrl ||
                                  (typeof wallpaperItem.image === 'string' ? wallpaperItem.image : null);
                  
                  if (imageUrl) {
                    return (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                        onLoadStart={() => handleImageLoadStart(item._id)}
                        onLoadEnd={() => handleImageLoadEnd(item._id)}
                        onError={(error) => {
                          console.error("Image load error for", item._id, "URL:", imageUrl, "Error:", error);
                        }}
                      />
                    );
                  } else {
                    return (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={32} color={Colors.textSecondary} />
                        <Text style={styles.placeholderText}>No Image</Text>
                      </View>
                    );
                  }
                })()}
                <View style={styles.overlay}>
                  <View style={styles.overlayGradient} />
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item._id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
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
  headerSection: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  grid: {
    padding: 16,
  },
  card: {
    margin: 5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    zIndex: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  loadingContainerFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
});