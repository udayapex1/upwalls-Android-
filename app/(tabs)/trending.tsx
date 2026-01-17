import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { useWallpapers } from "@/src/context/WallpapersContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const getNumColumns = () => {
  if (SCREEN_WIDTH >= 1024) return 3;
  if (SCREEN_WIDTH >= 768) return 2;
  return 2;
};

const getCardSize = () => {
  const numColumns = getNumColumns();
  const spacing = 12;
  const horizontalPadding = 20;
  const totalSpacing = (numColumns + 1) * spacing;
  const availableWidth = SCREEN_WIDTH - horizontalPadding * 2 - totalSpacing;
  return availableWidth / numColumns;
};

// Random height generator for masonry effect
const getRandomHeight = (index: number) => {
  const baseHeight = 200;
  const heights = [baseHeight, baseHeight * 1.2, baseHeight * 1.4, baseHeight * 1.1];
  return heights[index % heights.length];
};

type FilterType = "all" | "popular" | "recent" | "topRated";

export default function Trending() {
  const { allWallpapers, isLoading } = useWallpapers();
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
  const [numColumns] = useState(getNumColumns());
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const insets = useSafeAreaInsets();
  const cardSize = getCardSize();

  // Filter and sort wallpapers based on active filter
  const filteredWallpapers = useMemo(() => {
    let filtered = [...allWallpapers];

    switch (activeFilter) {
      case "popular":
        // Sort by likes (descending)
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;

      case "recent":
        // Sort by creation date (newest first)
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        break;

      case "topRated":
        // Sort by number of people who liked (likedBy array length)
        filtered.sort((a, b) => {
          const ratingA = a.likedBy?.length || 0;
          const ratingB = b.likedBy?.length || 0;
          return ratingB - ratingA;
        });
        break;

      case "all":
      default:
        // Random shuffle for "All"
        filtered.sort(() => Math.random() - 0.5);
        break;
    }

    return filtered;
  }, [allWallpapers, activeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Re-shuffle or re-apply filter
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleImageLoadStart = (id: string) => {
    setImageLoading((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageLoadEnd = (id: string) => {
    setImageLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleWallpaperPress = (wallpaper: any) => {
    const imageUrl =
      wallpaper.wallpaperImage?.url ||
      wallpaper.image?.url ||
      wallpaper.image?.secure_url ||
      wallpaper.imageUrl ||
      wallpaper.url;

    router.push({
      pathname: "/wallpapers/[id]",
      params: {
        id: wallpaper._id,
        uri: imageUrl,
      },
    });
  };

  const getImageUrl = (wallpaper: any) => {
    return (
      wallpaper.wallpaperImage?.url ||
      wallpaper.image?.url ||
      wallpaper.image?.secure_url ||
      wallpaper.imageUrl ||
      wallpaper.url ||
      wallpaper.photo?.url ||
      wallpaper.photoUrl ||
      null
    );
  };

  const getFilterDescription = () => {
    switch (activeFilter) {
      case "popular":
        return "Most liked wallpapers";
      case "recent":
        return "Recently uploaded wallpapers";
      case "topRated":
        return "Highest rated wallpapers";
      case "all":
      default:
        return "All wallpapers in random order";
    }
  };

  const renderWallpaperCard = ({ item, index }: { item: any; index: number }) => {
    const imageUrl = getImageUrl(item);
    const cardHeight = getRandomHeight(index);

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardSize, height: cardHeight }]}
        activeOpacity={0.9}
        onPress={() => handleWallpaperPress(item)}
      >
        <View style={styles.cardContent}>
          {imageLoading[item._id] && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.textSecondary} />
            </View>
          )}

          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
              onLoadStart={() => handleImageLoadStart(item._id)}
              onLoadEnd={() => handleImageLoadEnd(item._id)}
              onError={(error) => {
                console.error("Image load error:", error);
              }}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={32} color={Colors.textSecondary} />
            </View>
          )}

          {/* Overlay Gradient */}
          <View style={styles.overlay} />

          {/* Card Info */}
          <View style={styles.cardInfo}>
            {/* User Info */}
            {item.userName && (
              <View style={styles.userInfo}>
                {item.userProfile ? (
                  <Image
                    source={{ uri: item.userProfile.replace("http://", "https://") }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                    <Ionicons name="person" size={12} color="#fff" />
                  </View>
                )}
                <Text style={styles.userName} numberOfLines={1}>
                  {item.userName}
                </Text>
              </View>
            )}

            {/* Title */}
            {item.title && (
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
            )}

            {/* Category Badge */}
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {item.category}
                </Text>
              </View>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={14} color="#ff6b6b" />
                <Text style={styles.statText}>{item.likes || 0}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="download" size={14} color="#fff" />
                <Text style={styles.statText}>
                  {item.likedBy?.length || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle favorite toggle
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="heart-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <TopNavbar title="Trending" 
         logoSource={{
    uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
  }}
      />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Trending Wallpapers</Text>
          <Text style={styles.headerSubtitle}>
            {filteredWallpapers.length} wallpapers • {getFilterDescription()}
          </Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterChips}>
          <TouchableOpacity
            style={activeFilter === "all" ? styles.chipActive : styles.chip}
            activeOpacity={0.7}
            onPress={() => handleFilterChange("all")}
          >
            <Text
              style={
                activeFilter === "all" ? styles.chipTextActive : styles.chipText
              }
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={activeFilter === "popular" ? styles.chipActive : styles.chip}
            activeOpacity={0.7}
            onPress={() => handleFilterChange("popular")}
          >
            <Ionicons
              name="flame"
              size={14}
              color={activeFilter === "popular" ? "#fff" : "#666"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={
                activeFilter === "popular"
                  ? styles.chipTextActive
                  : styles.chipText
              }
            >
              Popular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={activeFilter === "recent" ? styles.chipActive : styles.chip}
            activeOpacity={0.7}
            onPress={() => handleFilterChange("recent")}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={activeFilter === "recent" ? "#fff" : "#666"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={
                activeFilter === "recent"
                  ? styles.chipTextActive
                  : styles.chipText
              }
            >
              Recent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={activeFilter === "topRated" ? styles.chipActive : styles.chip}
            activeOpacity={0.7}
            onPress={() => handleFilterChange("topRated")}
          >
            <Ionicons
              name="star"
              size={14}
              color={activeFilter === "topRated" ? "#fff" : "#666"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={
                activeFilter === "topRated"
                  ? styles.chipTextActive
                  : styles.chipText
              }
            >
              Top Rated
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading State */}
      {isLoading && filteredWallpapers.length === 0 ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
          <Text style={styles.loadingText}>Loading wallpapers...</Text>
        </View>
      ) : (
        /* Wallpapers Grid */
        <FlatList
          data={filteredWallpapers}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          key={`${numColumns}-${activeFilter}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: insets.bottom + 100 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.textPrimary}
              colors={[Colors.textPrimary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="trending-up-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyText}>No wallpapers available</Text>
              <Text style={styles.emptySubtext}>
                Check back soon for trending wallpapers
              </Text>
            </View>
          }
          renderItem={renderWallpaperCard}
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerContent: {
    marginTop: 8,
    marginBottom: 16,
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
  filterChips: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  chipActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#000",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  chipTextActive: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  grid: {
    padding: 20,
  },
  card: {
    margin: 6,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardContent: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
    zIndex: 1,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    gap: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  userAvatarPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
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
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14, 
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
});