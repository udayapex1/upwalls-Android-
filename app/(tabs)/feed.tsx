import React, { useState, useRef, useMemo } from "react";
import { 
  View, Text, FlatList, Image, Dimensions, StyleSheet, 
  ActivityIndicator, TouchableWithoutFeedback, Animated, TouchableOpacity 
} from "react-native";
import { useWallpapers } from "@/src/context/WallpapersContext";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { height, width } = Dimensions.get("window");

// Fisher-Yates shuffle algorithm for true randomization
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface WallpaperItemProps {
  item: any;
  onPress: (wallpaper: any) => void;
}

const WallpaperItem: React.FC<WallpaperItemProps> = ({ item, onPress }) => {
  const [liked, setLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const insets = useSafeAreaInsets();
  const likeScale = useRef(new Animated.Value(0)).current;
  let lastTap: number | null = null;

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) {
      setLiked(!liked);
      Animated.sequence([
        Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, tension: 40 }),
        Animated.delay(500),
        Animated.spring(likeScale, { toValue: 0, useNativeDriver: true }),
      ]).start();
    } else {
      lastTap = now;
    }
  };

  const handleDownload = async (e: any) => {
    e.stopPropagation();
    setDownloading(true);
    // Simulate download
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  const handleViewDetails = () => {
    onPress(item);
  };

  const getImageUrl = () => {
    return (
      item.wallpaperImage?.url ||
      item.image?.url ||
      item.image?.secure_url ||
      item.imageUrl ||
      item.url ||
      item.photo?.url ||
      item.photoUrl ||
      null
    );
  };

  const imageUrl = getImageUrl();

  return (
    <TouchableWithoutFeedback onPress={handleDoubleTap}>
      <View style={styles.wallpaperContainer}>
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
              onError={(error) => console.error("Image load error:", error)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={64} color="#666" />
            </View>
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
            style={styles.gradientOverlay}
          />

          {/* Info Overlay */}
          <View style={styles.infoOverlay}>
            {/* User Info */}
            {item.userName && (
              <View style={styles.userSection}>
                <View style={styles.userInfo}>
                  {item.userProfile ? (
                    <Image
                      source={{ uri: item.userProfile }}
                      style={styles.userAvatar}
                    />
                  ) : (
                    <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                      <Ionicons name="person" size={16} color="#fff" />
                    </View>
                  )}
                  <View style={styles.userDetails}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.userName}
                    </Text>
                    {item.category && (
                      <Text style={styles.userCategory} numberOfLines={1}>
                        {item.category}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Title */}
            {item.title && (
              <Text style={styles.wallpaperTitle} numberOfLines={2}>
                {item.title}
              </Text>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Ionicons name="heart" size={16} color="#ff6b6b" />
                <Text style={styles.statText}>{item.likes || 0}</Text>
              </View>
              <View style={styles.statBadge}>
                <Ionicons name="download" size={16} color="#fff" />
                <Text style={styles.statText}>
                  {item.likedBy?.length || 0}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewDetailsButton}
                onPress={handleViewDetails}
                activeOpacity={0.8}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Double Tap Heart Animation */}
        <Animated.View style={[styles.heartOverlay, { transform: [{ scale: likeScale }] }]}>
          <Ionicons name="heart" size={120} color="white" />
        </Animated.View>       
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function Feed() {
  const { allWallpapers, isLoading } = useWallpapers();
  const insets = useSafeAreaInsets();
  const [refreshKey, setRefreshKey] = useState(0);

  // Randomize wallpapers using Fisher-Yates shuffle
  const randomizedWallpapers = useMemo(() => {
    return shuffleArray(allWallpapers);
  }, [allWallpapers, refreshKey]);

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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading wallpapers...</Text>
      </View>
    );
  }

  if (randomizedWallpapers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={64} color="#666" />
        <Text style={styles.emptyText}>No wallpapers available</Text>
        <Text style={styles.emptySubtext}>Check back soon for new content</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Overlay */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Scroll</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleRefresh}
            activeOpacity={0.7}
          >
            {/* <Ionicons name="shuffle-outline" size={24} color="#000" /> */}
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={randomizedWallpapers}
        renderItem={({ item }) => (
          <WallpaperItem item={item} onPress={handleWallpaperPress} />
        )}
        keyExtractor={(item, index) => `${item._id}-${index}-${refreshKey}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
      />

      {/* Wallpaper Counter */}
      <View style={[styles.counterBadge, { bottom: insets.bottom + 20 }]}>
        <Ionicons name="images-outline" size={16} color="#fff" />
        <Text style={styles.counterText}>
          {randomizedWallpapers.length} wallpapers
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  wallpaperContainer: { 
    width: width, 
    height: height,
    paddingHorizontal: 15,
    paddingTop: 100,
    paddingBottom: 100,
  },

  imageWrapper: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },

  image: { 
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },

  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },

  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 16,
  },

  userSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  userAvatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userDetails: {
    gap: 4,
  },

  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  userCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  wallpaperTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 30,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  statText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },

  viewDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 24,
  },

  viewDetailsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  downloadFab: {
    position: 'absolute',
    right: 30,
    backgroundColor: '#fff',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  likeFab: {
    position: 'absolute',
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  heartOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    pointerEvents: 'none',
  },

  counterBadge: {
    position: 'absolute',
    left: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  counterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});