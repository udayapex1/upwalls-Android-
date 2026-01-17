import Toast from "@/src/components/Toast";
import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { useWallpapers } from "@/src/context/WallpapersContext";
import { checkForUpdates } from "@/src/services/appInfo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

// Shuffle function using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
 
const { version } = Constants.expoConfig;

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

export default function Explore() {
  const [numColumns] = useState(getNumColumns());
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
  const [showVersionToast, setShowVersionToast] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const insets = useSafeAreaInsets();
  const { allWallpapers, isLoading, refreshAllWallpapers } = useWallpapers();
  const cardSize = getCardSize();
  const cardHeight = cardSize * 1.5;

  // Randomize wallpapers on every render using useMemo to prevent unnecessary re-shuffles
  const randomizedWallpapers = useMemo(() => {
    return shuffleArray(allWallpapers);
  }, [allWallpapers]);

  // Debug: Log wallpapers data
  useEffect(() => {
    console.log("Explore - allWallpapers length:", allWallpapers.length);
    console.log("Explore - isLoading:", isLoading);
    if (allWallpapers.length > 0) {
      const firstWallpaper = allWallpapers[0] as any;
      console.log("Explore - First wallpaper full:", JSON.stringify(firstWallpaper, null, 2));
      console.log("Explore - First wallpaper keys:", Object.keys(firstWallpaper));
      console.log("Explore - First wallpaper image field:", firstWallpaper.image);
      console.log("Explore - First wallpaper imageUrl field:", firstWallpaper.imageUrl);
      console.log("Explore - First wallpaper url field:", firstWallpaper.url);
      
      const testUrl = firstWallpaper.image?.url || 
                     firstWallpaper.image?.secure_url ||
                     firstWallpaper.imageUrl || 
                     firstWallpaper.url;
      console.log("Explore - Extracted image URL:", testUrl);
    }
  }, [allWallpapers, isLoading]);

  // Refresh wallpapers when component mounts
  // Check for updates on mount
  useEffect(() => {
    refreshAllWallpapers();

    const checkUpdates = async () => {
      // Small delay to let app settle
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await checkForUpdates();
      if (result.hasUpdate) {
        setUpdateAvailable(true);
        setShowVersionToast(true);
      } else {
        setUpdateAvailable(false);
        // Optional: show "latest version" toast for a short time
        setShowVersionToast(true);
      }
    };

    checkUpdates();
  }, []);

  const handleImageLoadStart = (id: string) => {
    setImageLoading((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageLoadEnd = (id: string) => {
    setImageLoading((prev) => ({ ...prev, [id]: false }));
  };
 
  const getDisplayCount = (count: number) => {
  if (count < 10) return `${count}`;
  return `${Math.floor(count / 50) * 50}+`;
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <TopNavbar title="Explore"
      onPressLogo={() => router.push("/check-update")}
      logoSource={{
    uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
  }}/>
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discover Wallpapers</Text>
          <Text style={styles.headerSubtitle}>
          {getDisplayCount(allWallpapers.length)} {allWallpapers.length === 1 ? "wallpaper" : "wallpapers"} available
          </Text>
        </View>
      </View>

      {/* Loading State */}
      {isLoading && allWallpapers.length === 0 ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
          <Text style={styles.loadingText}>Loading wallpapers...</Text>
        </View>
      ) : (
        /* Wallpaper Grid */
        <FlatList
          data={randomizedWallpapers}
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
              <Ionicons name="images-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>No wallpapers available</Text>
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
                <View style={styles.cardBadge}>
                  <Ionicons name="image-outline" size={14} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      
      <Toast 
        message={updateAvailable ? "New version is available. Click to update" : `You are using version ${version}`}
        visible={showVersionToast} 
        onHide={() => setShowVersionToast(false)}
        type={updateAvailable ? "info" : "success"}
        duration={updateAvailable ? 6000 : 3000}
        onPress={updateAvailable ? () => {
          setShowVersionToast(false);
          router.push("/check-update");
        } : undefined}
      />
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
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
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
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cardBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 6,
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
});