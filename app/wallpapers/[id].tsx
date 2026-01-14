import { Colors } from "@/src/constants/color";
import { useWallpapers } from "@/src/context/WallpapersContext";
import { Wallpaper } from "@/src/services/wallpapers";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WallpaperPreview() {
  const params = useLocalSearchParams();
  const { id, uri } = params;
  const insets = useSafeAreaInsets();
  const { getWallpaper, allWallpapers } = useWallpapers();
  const [downloading, setDownloading] = useState(false);
  const [applyingWallpaper, setApplyingWallpaper] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const qrCodeRef = useRef<any>(null);

  useEffect(() => {
    const fetchWallpaper = async () => {
      if (id) {
        setLoading(true);
        try {
          const cachedWallpaper = allWallpapers.find(w => w._id === id);
          
          if (cachedWallpaper) {
            console.log("Found wallpaper in cache");
            setWallpaper(cachedWallpaper);
            setLoading(false);
            return;
          }

          const wallpaperData = await getWallpaper(id as string);
          if (wallpaperData) {
            setWallpaper(wallpaperData);
            console.log("Wallpaper loaded from API:", JSON.stringify(wallpaperData, null, 2));
          } else {
            console.log("Wallpaper not found for ID:", id);
            if (uri) {
              console.log("Using uri parameter as fallback");
              setWallpaper({
                _id: id as string,
                wallpaperImage: { public_id: '', url: uri as string },
              } as Wallpaper);
            }
          }
        } catch (error) {
          console.error("Error fetching wallpaper:", error);
          if (uri) {
            setWallpaper({
              _id: id as string,
              wallpaperImage: { public_id: '', url: uri as string },
            } as Wallpaper);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWallpaper();
  }, [id, allWallpapers, getWallpaper]);

  const getImageUrl = () => {
    if (wallpaper) {
      const wallpaperItem = wallpaper as any;
      const url = wallpaperItem.wallpaperImage?.url || 
                  wallpaperItem.image?.url || 
                  wallpaperItem.image?.secure_url ||
                  wallpaperItem.imageUrl || 
                  wallpaperItem.url || 
                  wallpaperItem.photo?.url ||
                  wallpaperItem.photoUrl ||
                  (typeof wallpaperItem.image === 'string' ? wallpaperItem.image : null);
      
      if (url) {
        console.log("Image URL found:", url);
        return url;
      } else {
        console.log("No image URL in wallpaper object. Keys:", Object.keys(wallpaperItem));
      }
    }
    
    if (uri) {
      console.log("Using URI parameter:", uri);
      return uri as string;
    }
    
    console.log("No image URL available");
    return null;
  };

  const imageUrl = getImageUrl();

  const handleDownload = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "Image URL not available");
      return;
    }

    try {
      setDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery access needed to save wallpapers");
        setDownloading(false);
        return;
      }

      const fileUri =
        FileSystem.documentDirectory + `upwalls_${id || Date.now()}_${Date.now()}.jpg`;

      const downloadResult = await FileSystem.downloadAsync(
        imageUrl,
        fileUri
      );

      await MediaLibrary.createAssetAsync(downloadResult.uri);

      Alert.alert("Success", "Wallpaper saved to gallery");
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download");
    } finally {
      setDownloading(false);
    }
  };

  const handleSetWallpaper = async () => {
    if (!imageUrl) {
      Alert.alert("Error", "Image URL not available");
      return;
    }

    // Show options dialog
    Alert.alert(
      "Set as Wallpaper",
      "Choose where to apply this wallpaper",
      [
        {
          text: "Home Screen",
          onPress: () => applyWallpaper("home"),
        },
        {
          text: "Lock Screen",
          onPress: () => applyWallpaper("lock"),
        },
        {
          text: "Both",
          onPress: () => applyWallpaper("both"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const applyWallpaper = async (location: "home" | "lock" | "both") => {
    try {
      setApplyingWallpaper(true);

      // First, download the image to local storage
      const fileUri =
        FileSystem.documentDirectory + `wallpaper_temp_${Date.now()}.jpg`;

      console.log("Downloading wallpaper to:", fileUri);
      const downloadResult = await FileSystem.downloadAsync(imageUrl!, fileUri);

      console.log("Download result:", downloadResult);

      if (Platform.OS === "android") {
        // For Android, we need to save to gallery first, then guide user
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Gallery access needed to set wallpaper"
          );
          setApplyingWallpaper(false);
          return;
        }

        // Save to gallery
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        console.log("Asset created:", asset);

        // Since React Native doesn't have native wallpaper API,
        // we guide the user to set it manually
        Alert.alert(
          "Wallpaper Saved",
          "The wallpaper has been saved to your gallery. To set it:\n\n" +
          "1. Open your device Settings\n" +
          "2. Go to Display > Wallpaper\n" +
          "3. Choose the saved image from your gallery\n\n" +
          "Would you like to open Settings now?",
          [
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "android") {
                  Linking.openSettings();
                }
              },
            },
            {
              text: "Open Gallery",
              onPress: async () => {
                // Open gallery app
                const galleryUrl = Platform.select({
                  android: "content://media/internal/images/media",
                  ios: "photos-redirect://",
                });
                if (galleryUrl) {
                  try {
                    await Linking.openURL(galleryUrl);
                  } catch (error) {
                    console.error("Error opening gallery:", error);
                    Alert.alert("Info", "Please open your Photos app manually");
                  }
                }
              },
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      } else {
        // For iOS
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Photos access needed to set wallpaper"
          );
          setApplyingWallpaper(false);
          return;
        }

        // Save to photo library
        await MediaLibrary.createAssetAsync(downloadResult.uri);

        Alert.alert(
          "Wallpaper Saved",
          "The wallpaper has been saved to your Photos. To set it:\n\n" +
          "1. Open Settings > Wallpaper\n" +
          "2. Choose a New Wallpaper\n" +
          "3. Select the saved image\n\n" +
          "Would you like to open Settings?",
          [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error applying wallpaper:", error);
      Alert.alert(
        "Error",
        "Failed to prepare wallpaper. Please try downloading it first."
      );
    } finally {
      setApplyingWallpaper(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Not supported", "Sharing is not available");
        return;
      }

      if (!imageUrl) {
        Alert.alert("Error", "Image URL not available");
        return;
      }

      const fileUri =
        FileSystem.documentDirectory + `upwalls_share_${id || Date.now()}.jpg`;

      const downloadResult = await FileSystem.downloadAsync(
        imageUrl,
        fileUri
      );

      await Sharing.shareAsync(downloadResult.uri);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to share wallpaper");
    }
  };

  const getShareableUrl = () => {
    if (!id) return "";
    const baseUrl = Linking.createURL("/wallpapers/[id]", {
      queryParams: { id: id as string },
    });
    return baseUrl;
  };

  const handleShareQRCode = async () => {
    try {
      if (!qrCodeRef.current) {
        Alert.alert("Error", "QR code not available");
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Not supported", "Sharing is not available");
        return;
      }

      const dataUri = await new Promise<string>((resolve, reject) => {
        try {
          qrCodeRef.current?.toDataURL((data: string) => {
            if (data) {
              resolve(data);
            } else {
              reject(new Error("Failed to generate QR code image"));
            }
          });
        } catch (error) {
          reject(error);
        }
      });

      const base64Data = dataUri.replace(/^data:image\/png;base64,/, "");

      const fileUri =
        FileSystem.documentDirectory + `qr_code_${id || Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Unable to share QR code. You can take a screenshot instead.");
    }
  };

  const handleSaveQRCode = async () => {
    try {
      if (!qrCodeRef.current) {
        Alert.alert("Error", "QR code not available");
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery access needed to save QR code");
        return;
      }

      const dataUri = await new Promise<string>((resolve, reject) => {
        try {
          qrCodeRef.current?.toDataURL((data: string) => {
            if (data) {
              resolve(data);
            } else {
              reject(new Error("Failed to generate QR code image"));
            }
          });
        } catch (error) {
          reject(error);
        }
      });

      const base64Data = dataUri.replace(/^data:image\/png;base64,/, "");

      const fileUri =
        FileSystem.documentDirectory + `qr_code_${id || Date.now()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.createAssetAsync(fileUri);
      Alert.alert("Success", "QR code saved to gallery");
    } catch (error) {
      console.error("Error saving QR code:", error);
      Alert.alert("Error", "Failed to save QR code. You can take a screenshot instead.");
    }
  };

  const safeProfileUrl = (wallpaper as any)?.userProfile.replace(/^(http:\/\/|https:\/\/)/, 'https://');

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.textPrimary} />
        <Text style={styles.loadingText}>Loading wallpaper...</Text>
      </View>
    );
  }

  if (!imageUrl) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <Ionicons name="image-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.errorText}>Wallpaper not found</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
          activeOpacity={0.6}
        >
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setFullscreenVisible(true)}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={(error) => {
                console.error("Image load error:", error);
              }}
            />
          </TouchableOpacity>
          
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "transparent"]}
            style={styles.heroGradient}
          />

          {/* Top Header */}
          <View style={[styles.topHeader, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setIsFavorite(!isFavorite)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setQrCodeVisible(true)}
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Ionicons name="qr-code-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Fullscreen Indicator */}
          <View style={styles.fullscreenIndicator}>
            <Ionicons name="expand-outline" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.fullscreenText}>Tap to view fullscreen</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Title Section */}
          <View style={styles.headerSection}>
            <View style={styles.titleWrapper}>
              <Text style={styles.category}>
                {(wallpaper as any)?.category || "Wallpaper"}
              </Text>
              <Text style={styles.title}>
                {(wallpaper as any)?.title || "Beautiful Wallpaper"}
              </Text>
            </View>
          </View>

          {/* Primary Actions */}
          <View style={styles.primaryActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleDownload}
              disabled={downloading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#000", "#2a2a2a"]}
                style={styles.buttonGradient}
              >
                <Ionicons
                  name={downloading ? "hourglass-outline" : "download-outline"}
                  size={20}
                  color="#fff"
                />
                <Text style={styles.primaryButtonText}>
                  {downloading ? "Downloading..." : "Download"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSetWallpaper}
              disabled={applyingWallpaper}
              activeOpacity={0.8}
            >
              {applyingWallpaper ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={20}
                    color="#000"
                  />
                  <Text style={styles.secondaryButtonText}>Apply</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Tap "Apply" to save the wallpaper and get instructions to set it as your background
            </Text>
          </View>

          {/* Description */}
          {(wallpaper as any)?.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>
                {(wallpaper as any).description}
              </Text>
            </View>
          )}

          {/* User Info */}
          {(wallpaper as any)?.userName && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Creator</Text>
              <View style={styles.creatorCard}>
                <View style={styles.creatorLeft}>
                  {(wallpaper as any)?.userProfile ? (
                    <Image
                      source={{ uri: safeProfileUrl }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={20} color="#999" />
                    </View>
                  )}
                  <View style={styles.creatorInfo}>
                    <Text style={styles.creatorName}>
                      {(wallpaper as any)?.userName || "Unknown"}
                    </Text>
                    {(wallpaper as any)?.createdAt && (
                      <Text style={styles.creatorDate}>
                        Uploaded {new Date((wallpaper as any).createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statistics</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statIconWrapper}>
                  <Ionicons name="heart-outline" size={20} color="#000" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {((wallpaper as any)?.likes || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Likes</Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIconWrapper}>
                  <Ionicons name="download-outline" size={20} color="#000" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {((wallpaper as any)?.likedBy?.length || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Downloads</Text>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIconWrapper}>
                  <Ionicons name="eye-outline" size={20} color="#000" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>
                    {(Math.floor(Math.random() * 1000) + 100).toLocaleString()}
                  </Text>
                  <Text style={styles.statLabel}>Views</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsContainer}>
              {(wallpaper as any)?._id && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>ID</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {(wallpaper as any)._id}
                  </Text>
                </View>
              )}

              {(wallpaper as any)?.createdAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Created</Text>
                  <Text style={styles.detailValue}>
                    {new Date((wallpaper as any).createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              )}

              {(wallpaper as any)?.updatedAt && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Updated</Text>
                  <Text style={styles.detailValue}>
                    {new Date((wallpaper as any).updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              )}

              {(wallpaper as any)?.deviceSupport && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Device Support</Text>
                  <Text style={styles.detailValue}>
                    {(wallpaper as any).deviceSupport}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Fullscreen Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.fullscreenModal}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <TouchableOpacity
            style={styles.fullscreenBackdrop}
            activeOpacity={1}
            onPress={() => setFullscreenVisible(false)}
          >
            <View style={styles.fullscreenImageWrapper}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 10 }]}
            onPress={() => setFullscreenVisible(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        visible={qrCodeVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQrCodeVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.qrCodeModal}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <TouchableOpacity
            style={styles.qrCodeBackdrop}
            activeOpacity={1}
            onPress={() => setQrCodeVisible(false)}
          >
            <View style={styles.qrCodeContainer}>
              <View style={styles.qrCodeCard}>
                <Text style={styles.qrCodeTitle}>Share via QR Code</Text>
                <Text style={styles.qrCodeSubtitle}>
                  Scan this code to view this wallpaper
                </Text>
                
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={getShareableUrl() || `upwalls://wallpapers/${id}`}
                    size={250}
                    color="#000"
                    backgroundColor="#fff"
                    getRef={(c) => {
                      qrCodeRef.current = c;
                    }}
                  />
                </View>

                <View style={styles.qrCodeActions}>
                  <TouchableOpacity
                    style={styles.qrCodeActionButton}
                    onPress={handleSaveQRCode}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="download-outline" size={20} color="#000" />
                    <Text style={styles.qrCodeActionText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.qrCodeActionButton, styles.qrCodeActionButtonPrimary]}
                    onPress={handleShareQRCode}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-outline" size={20} color="#fff" />
                    <Text style={[styles.qrCodeActionText, styles.qrCodeActionTextPrimary]}>
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qrCodeCloseButton, { top: insets.top + 10 }]}
            onPress={() => setQrCodeVisible(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    position: "relative",
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: "#f5f5f5",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  topHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  topActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenIndicator: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullscreenText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
  contentSection: {
    backgroundColor: "#fff",
    paddingTop: 24,
    paddingHorizontal: 20,
},
headerSection: {
marginBottom: 24,
},
titleWrapper: {
gap: 8,
},
category: {
fontSize: 13,
fontWeight: "700",
color: "#666",
textTransform: "uppercase",
letterSpacing: 1.2,
},
title: {
fontSize: 28,
fontWeight: "800",
color: "#000",
lineHeight: 34,
},
primaryActions: {
flexDirection: "row",
gap: 12,
marginBottom: 16,
},
primaryButton: {
flex: 1,
borderRadius: 14,
overflow: "hidden",
elevation: 4,
shadowColor: "#000",
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.15,
shadowRadius: 8,
},
buttonGradient: {
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: 8,
paddingVertical: 16,
},
primaryButtonText: {
color: "#fff",
fontSize: 16,
fontWeight: "700",
},
secondaryButton: {
flex: 1,
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: 8,
paddingVertical: 16,
borderRadius: 14,
backgroundColor: "#f5f5f5",
borderWidth: 1.5,
borderColor: "#e5e5e5",
},
secondaryButtonText: {
color: "#000",
fontSize: 16,
fontWeight: "700",
},
infoCard: {
flexDirection: "row",
alignItems: "center",
gap: 12,
backgroundColor: "#f0f9ff",
padding: 16,
borderRadius: 12,
marginBottom: 32,
borderWidth: 1,
borderColor: "#bae6fd",
},
infoText: {
flex: 1,
fontSize: 13,
color: "#0369a1",
lineHeight: 18,
fontWeight: "500",
},
section: {
marginBottom: 32,
},
sectionTitle: {
fontSize: 18,
fontWeight: "700",
color: "#000",
marginBottom: 16,
},
description: {
fontSize: 15,
color: "#666",
lineHeight: 24,
},
creatorCard: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
padding: 16,
backgroundColor: "#f9f9f9",
borderRadius: 16,
borderWidth: 1,
borderColor: "#e5e5e5",
},
creatorLeft: {
flexDirection: "row",
alignItems: "center",
flex: 1,
},
avatar: {
width: 44,
height: 44,
borderRadius: 22,
marginRight: 12,
},
avatarPlaceholder: {
backgroundColor: "#e5e5e5",
justifyContent: "center",
alignItems: "center",
},
creatorInfo: {
flex: 1,
},
creatorName: {
fontSize: 16,
fontWeight: "700",
color: "#000",
marginBottom: 4,
},
creatorDate: {
fontSize: 13,
color: "#666",
},
statsContainer: {
flexDirection: "row",
backgroundColor: "#f9f9f9",
borderRadius: 16,
padding: 20,
borderWidth: 1,
borderColor: "#e5e5e5",
},
statItem: {
flex: 1,
flexDirection: "row",
alignItems: "center",
gap: 12,
},
statIconWrapper: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: "#fff",
justifyContent: "center",
alignItems: "center",
},
statContent: {
flex: 1,
},
statValue: {
fontSize: 18,
fontWeight: "800",
color: "#000",
marginBottom: 2,
},
statLabel: {
fontSize: 12,
fontWeight: "600",
color: "#666",
},
statDivider: {
width: 1,
height: "100%",
backgroundColor: "#e5e5e5",
marginHorizontal: 16,
},
detailsContainer: {
backgroundColor: "#f9f9f9",
borderRadius: 16,
padding: 16,
gap: 12,
borderWidth: 1,
borderColor: "#e5e5e5",
},
detailRow: {
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
paddingVertical: 4,
},
detailLabel: {
fontSize: 14,
fontWeight: "600",
color: "#666",
flex: 1,
},
detailValue: {
fontSize: 14,
fontWeight: "600",
color: "#000",
flex: 2,
textAlign: "right",
},
centerContent: {
justifyContent: "center",
alignItems: "center",
paddingHorizontal: 40,
},
loadingText: {
marginTop: 16,
fontSize: 14,
color: Colors.textSecondary,
},
errorText: {
marginTop: 16,
fontSize: 16,
color: Colors.textSecondary,
textAlign: "center",
},
backButtonError: {
marginTop: 24,
backgroundColor: "#000",
paddingHorizontal: 24,
paddingVertical: 12,
borderRadius: 24,
},
backText: {
fontSize: 16,
color: "#fff",
fontWeight: "600",
},
fullscreenModal: {
flex: 1,
backgroundColor: "#000",
},
fullscreenBackdrop: {
flex: 1,
justifyContent: "center",
alignItems: "center",
width: "100%",
height: "100%",
},
fullscreenImageWrapper: {
width: SCREEN_WIDTH,
height: SCREEN_HEIGHT,
justifyContent: "center",
alignItems: "center",
},
fullscreenImage: {
width: SCREEN_WIDTH,
height: SCREEN_HEIGHT,
},
closeButton: {
position: "absolute",
right: 20,
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: "rgba(0,0,0,0.6)",
justifyContent: "center",
alignItems: "center",
},
qrCodeModal: {
flex: 1,
backgroundColor: "rgba(0,0,0,0.7)",
justifyContent: "center",
alignItems: "center",
},
qrCodeBackdrop: {
flex: 1,
width: "100%",
justifyContent: "center",
alignItems: "center",
paddingHorizontal: 20,
},
qrCodeContainer: {
width: "100%",
maxWidth: 400,
alignItems: "center",
},
qrCodeCard: {
backgroundColor: "#fff",
borderRadius: 24,
padding: 24,
alignItems: "center",
width: "100%",
shadowColor: "#000",
shadowOffset: { width: 0, height: 8 },
shadowOpacity: 0.3,
shadowRadius: 16,
elevation: 8,
},
qrCodeTitle: {
fontSize: 22,
fontWeight: "800",
color: "#000",
marginBottom: 8,
textAlign: "center",
},
qrCodeSubtitle: {
fontSize: 14,
color: "#666",
marginBottom: 24,
textAlign: "center",
},
qrCodeWrapper: {
backgroundColor: "#fff",
padding: 20,
borderRadius: 16,
marginBottom: 24,
borderWidth: 2,
borderColor: "#f0f0f0",
},
qrCodeActions: {
flexDirection: "row",
gap: 12,
width: "100%",
},
qrCodeActionButton: {
flex: 1,
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: 8,
paddingVertical: 14,
borderRadius: 12,
backgroundColor: "#f5f5f5",
borderWidth: 1.5,
borderColor: "#e5e5e5",
},
qrCodeActionButtonPrimary: {
backgroundColor: "#000",
borderColor: "#000",
},
qrCodeActionText: {
fontSize: 15,
fontWeight: "700",
color: "#000",
},
qrCodeActionTextPrimary: {
color: "#fff",
},
qrCodeCloseButton: {
position: "absolute",
right: 20,
width: 44,
height: 44,
borderRadius: 22,
backgroundColor: "rgba(0,0,0,0.6)",
justifyContent: "center",
alignItems: "center",
},
});
