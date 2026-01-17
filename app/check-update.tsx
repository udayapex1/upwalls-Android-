import TopNavbar from "@/src/components/TopNavbar";
import { checkForUpdates, UpdateCheckResult } from "@/src/services/appInfo";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Image,
    Linking,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function CheckUpdate() {
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(true);
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardSlide = useRef(new Animated.Value(100)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    check();
    startPulseAnimation();
  }, []);

  useEffect(() => {
    if (!checking && result) {
      startContentAnimation();
      if (result.hasUpdate) {
        startShimmerAnimation();
      }
    }
  }, [checking, result]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startContentAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlide, {
        toValue: 0,
        tension: 35,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startShimmerAnimation = () => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const check = async () => {
    setChecking(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    cardSlide.setValue(100);
    try {
      const updateResult = await checkForUpdates();
      setResult(updateResult);
      console.log(updateResult);
    } catch (error) {
      console.error("Update check failed:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdatePress = () => {
    if (result?.storeUrl) {
      Linking.openURL(result.storeUrl);
    }
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Animated orbs */}
      <View style={styles.orbContainer}>
        {/* <View style={[styles.orb1]} /> */}
        <View style={[styles.orb2]} />
      </View>

      <TopNavbar 
        title="Update"
        logoSource={{
          uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
        }}
        showLogo={true} 
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        {/* Logo Section - Top Left */}
        <View style={styles.logoSection}>
          <View style={styles.logoGradientBorder}>
            <View style={styles.logoInner}>
              <Image
                source={{
                  uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767522460/upwallsLogo_fnorcm.png",
                }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>UpWalls</Text>
            <Text style={styles.appTagline}>Wallpaper Manager</Text>
          </View>
        </View>

        {/* Main Content Card */}
        {checking ? (
          <Animated.View style={[styles.statusCard, { opacity: pulseAnim }]}>
            <View style={styles.loadingContent}>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons name="sync-outline" size={48} color="#FFFFFF" />
              </Animated.View>
              <Text style={styles.loadingTitle}>Checking for updates</Text>
              <Text style={styles.loadingSubtitle}>Please wait a moment...</Text>
              
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.statusCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: cardSlide }],
              },
            ]}
          >
            {result?.hasUpdate ? (
              <>
                <View style={styles.updateContent}>
                  <View style={styles.updateIconContainer}>
                    <View style={styles.updateIconGradient}>
                      <Ionicons name="arrow-up-circle" size={40} color="#000" />
                    </View>
                  </View>

                  <Text style={styles.updateTitle}>New Update Available</Text>
                  <Text style={styles.updateVersion}>Version {result.latestVersion}</Text>
                  <Text style={styles.updateMessage}>
                    A newer version is ready to download. Update now to get the latest features and improvements.
                  </Text>

                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdatePress}
                    activeOpacity={0.9}
                  >
                    <View style={styles.buttonGradient}>
                      <Animated.View
                        style={[
                          styles.shimmer,
                          { transform: [{ translateX: shimmerTranslate }] },
                        ]}
                      />
                      <Text style={styles.updateButtonText}>Update Now</Text>
                      <Ionicons name="download-outline" size={20} color="#000" />
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.successContent}>
                  <View style={styles.successIconContainer}>
                    <View style={styles.successIconGradient}>
                      <Ionicons name="checkmark-circle" size={40} color="#000" />
                    </View>
                  </View>

                  <Text style={styles.successTitle}>You're All Set</Text>
                  <Text style={styles.successVersion}>Version {result?.currentVersion}</Text>
                  <Text style={styles.successMessage}>
                    You're running the latest version. No updates available at this time.
                  </Text>

                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={check}
                    activeOpacity={0.9}
                  >
                    <View style={styles.checkButtonGradient}>
                      <Text style={styles.checkButtonText}>Check Again</Text>
                      <Ionicons name="refresh-outline" size={18} color="#FFF" />
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        )}

        {/* Version Info Footer */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.footerText}>
            Current Version: {result?.currentVersion || '...'}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -200,
    right: -100,
    backgroundColor: '#1A1A1A',
    opacity: 0.5,
  },
  orb2: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    bottom: -150,
    left: -80,
    backgroundColor: '#0D0D0D',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGradientBorder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    padding: 2,
    backgroundColor: '#FFFFFF',
  },
  logoInner: {
    flex: 1,
    transform: [{scale:1 }],
    backgroundColor: '#ffff',
    borderRadius: 18,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    transform: [{scale:1.5 }],
    width: '100%',
    height: '100%',
  },
  appInfo: {
    marginLeft: 16,
  },
  appName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0000',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    color: '#737373',
    marginTop: 2,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 24,
  },
  loadingSubtitle: {
    fontSize: 15,
    color: '#737373',
    marginTop: 8,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 2,
    marginTop: 32,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '60%',
    backgroundColor: '#FFFFFF',
  },
  updateContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  updateIconContainer: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  updateIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  updateTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  updateVersion: {
    fontSize: 20,
    fontWeight: '600',
    color: '#A3A3A3',
    marginBottom: 16,
  },
  updateMessage: {
    fontSize: 15,
    color: '#737373',
    lineHeight: 24,
    marginBottom: 32,
  },
  updateButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    transform: [{ skewX: '-20deg' }],
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  successContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  successIconContainer: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  successIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  successVersion: {
    fontSize: 20,
    fontWeight: '600',
    color: '#A3A3A3',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 15,
    color: '#737373',
    lineHeight: 24,
    marginBottom: 32,
  },
  checkButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#262626',
    borderRadius: 14,
    backgroundColor: '#0D0D0D',
  },
  checkButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#525252',
    fontWeight: '500',
  },
});