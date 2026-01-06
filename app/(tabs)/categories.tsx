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
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

interface CategoryData {
  name: string;
  count: number;
  previewImage?: string;
  wallpapers: any[];
}

export default function Categories() {
  const [numColumns] = useState(getNumColumns());
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const { allWallpapers, isLoading } = useWallpapers();
  const cardSize = getCardSize();
  const cardHeight = cardSize * 1.2;

  // Extract and group categories from wallpapers
  const allCategories = useMemo(() => {
    const categoryMap = new Map<string, any[]>();

    allWallpapers.forEach((wallpaper: any) => {
      const category = wallpaper.category || "Uncategorized";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(wallpaper);
    });

    const categoryArray: CategoryData[] = Array.from(categoryMap.entries()).map(
      ([name, wallpapers]) => {
        const firstWallpaper = wallpapers[0] as any;
        const previewImage =
          firstWallpaper.wallpaperImage?.url ||
          firstWallpaper.image?.url ||
          firstWallpaper.image?.secure_url ||
          firstWallpaper.imageUrl ||
          firstWallpaper.url ||
          firstWallpaper.photo?.url ||
          firstWallpaper.photoUrl ||
          null;

        return {
          name,
          count: wallpapers.length,
          previewImage,
          wallpapers,
        };
      }
    );

    return categoryArray.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
  }, [allWallpapers]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCategories;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allCategories.filter(category =>
      category.name.toLowerCase().includes(query)
    );
  }, [allCategories, searchQuery]);

  const handleImageLoadStart = (categoryName: string) => {
    setImageLoading((prev) => ({ ...prev, [categoryName]: true }));
  };

  const handleImageLoadEnd = (categoryName: string) => {
    setImageLoading((prev) => ({ ...prev, [categoryName]: false }));
  };

  const handleCategoryPress = (category: CategoryData) => {
    router.push({
      pathname: "/categories/[category]",
      params: {
        category: category.name,
      },
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <TopNavbar title="Categories"
        logoSource={{
    uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
  }}
      />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Browse by Category</Text>
          <Text style={styles.headerSubtitle}>
            {allCategories.length} {allCategories.length === 1 ? "category" : "categories"} available
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          searchFocused && styles.searchContainerFocused
        ]}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={searchFocused ? Colors.textPrimary : Colors.textSecondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={clearSearch}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results Info */}
        {searchQuery.trim() && (
          <View style={styles.searchResultsInfo}>
            <Text style={styles.searchResultsText}>
              {filteredCategories.length} {filteredCategories.length === 1 ? "result" : "results"} found
            </Text>
          </View>
        )}
      </View>

      {/* Loading State */}
      {isLoading && allCategories.length === 0 ? (
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : (
        /* Categories Grid */
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.name}
          numColumns={numColumns}
          key={numColumns}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: insets.bottom + 100 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={searchQuery.trim() ? "search-outline" : "grid-outline"} 
                size={64} 
                color={Colors.textSecondary} 
              />
              <Text style={styles.emptyText}>
                {searchQuery.trim() ? "No categories found" : "No categories available"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery.trim() 
                  ? `No categories match "${searchQuery}"`
                  : "Categories will appear as wallpapers are added"
                }
              </Text>
              {searchQuery.trim() && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={clearSearch}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearSearchText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { width: cardSize, height: cardHeight }]}
              activeOpacity={0.85}
              onPress={() => handleCategoryPress(item)}
            >
              <View style={styles.imageContainer}>
                {imageLoading[item.name] && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.textSecondary} />
                  </View>
                )}
                {item.previewImage ? (
                  <Image
                    source={{ uri: item.previewImage }}
                    style={styles.image}
                    resizeMode="cover"
                    onLoadStart={() => handleImageLoadStart(item.name)}
                    onLoadEnd={() => handleImageLoadEnd(item.name)}
                    onError={(error) => {
                      console.error("Category image load error:", error);
                    }}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="grid-outline" size={32} color={Colors.textSecondary} />
                  </View>
                )}
                <View style={styles.overlay}>
                  <View style={styles.overlayGradient} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.categoryBadge}>
                    <Ionicons name="images-outline" size={12} color="#fff" />
                    <Text style={styles.categoryCount}>{item.count}</Text>
                  </View>
                </View>
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
    paddingTop: 16,
    paddingBottom: 20,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 2,
    borderColor: "transparent",
  },
  searchContainerFocused: {
    backgroundColor: "#fff",
    borderColor: Colors.textPrimary,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchResultsInfo: {
    marginTop: 12,
    paddingLeft: 4,
  },
  searchResultsText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  grid: {
    padding: 20,
  },
  card: {
    margin: 6,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.surface,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  categoryInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 2,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
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
    lineHeight: 20,
  },
  clearSearchButton: {
    marginTop: 20,
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
});