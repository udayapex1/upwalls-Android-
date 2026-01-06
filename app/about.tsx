import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function About() {
  const router = useRouter();

  const features = [
    {
      icon: "shield-checkmark-outline",
      title: "Premium Curation",
      desc: "Each wallpaper is hand-selected for visual integrity.",
    },
    {
      icon: "layers-outline",
      title: "High Resolution",
      desc: "Optimized for the latest mobile display standards.",
    },
    {
      icon: "speedometer-outline",
      title: "Performance",
      desc: "Engineered for speed with zero background bloat.",
    },
    {
      icon: "eye-off-outline",
      title: "Privacy First",
      desc: "Zero tracking. No ads. Just high-quality art.",
    },
  ];

  const roadmap = [
    { icon: "bookmark-outline", text: "Cloud-synced Collections" },
    { icon: "options-outline", text: "Advanced Metadata Filtering" },
    { icon: "hardware-chip-outline", text: "AI-Powered Upscaling" },
  ];

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.fixedBack}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={22} color="#000" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767450687/Screenshot_from_2026-01-03_20-00-01_hbajx8.png",
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={styles.bannerOverlay}
          >
            <View>
              <Text style={styles.bannerCategory}>VERSION 1.0</Text>
              <Text style={styles.bannerTitle}>About UpWall</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MISSION</Text>
          <Text style={styles.brandTitle}>Elevating your digital canvas.</Text>
          <Text style={styles.brandDesc}>
            UpWall was designed to eliminate clutter from wallpaper apps. No
            ads, no distractions — just a clean experience focused on
            high-fidelity visual content.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.grid}>
          {features.map((item, i) => (
            <View key={i} style={styles.featureItem}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={20} color="#000" />
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        {/* Philosophy */}
        <View style={styles.textSection}>
          <Text style={styles.sectionLabel}>THE ARCHITECTURE</Text>
          <Text style={styles.bodyText}>
            UpWall is an indie-built product. Every decision prioritizes
            performance, simplicity, and respect for the user.
          </Text>
        </View>

        {/* Roadmap */}
        <View style={styles.roadmapSection}>
          <Text style={styles.sectionLabel}>PRODUCT ROADMAP</Text>
          {roadmap.map((item, i) => (
            <View key={i} style={styles.roadmapRow}>
              <View style={styles.indicator} />
              <Ionicons
                name={item.icon}
                size={18}
                color="#666"
                style={{ marginRight: 12 }}
              />
              <Text style={styles.roadmapText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Developer / Hire Me Card */}
        <View style={styles.developerCard}>
          <View style={styles.devHeader}>
            <View style={styles.devIconBox}>
              <Ionicons name="person" size={28} color="#000" />
            </View>
            <View>
              <Text style={styles.devLabel}>Built By</Text>
              <Text style={styles.devName}>Uday Pareta</Text>
            </View>
          </View>

          <Text style={styles.devBio}>
            Indie developer focused on clean UI, performance-first apps, and
            meaningful products.
          </Text>

          <View style={styles.devActions}>
            {/* Contact */}
            <TouchableOpacity
              onPress={() => {
                const email =
                  "mailto:udaypareta645@gmail.com?subject=UpWall%20Support";
                import("react-native").then(({ Linking }) =>
                  Linking.openURL(email)
                );
              }}
              style={styles.primaryButton}
              activeOpacity={0.85}
            >
              <Ionicons name="mail" size={18} color="#000" />
              <Text style={styles.primaryButtonText}>Contact</Text>
            </TouchableOpacity>

            {/* Hire Me */}
            <TouchableOpacity
              onPress={() => {
                const email =
                  "mailto:udaypareta645@gmail.com?subject=Hiring%20Inquiry";
                import("react-native").then(({ Linking }) =>
                  Linking.openURL(email)
                );
              }}
              style={styles.secondaryButton}
              activeOpacity={0.85}
            >
              <Ionicons name="briefcase-outline" size={18} color="#fff" />
              <Text style={styles.secondaryButtonText}>Hire Me</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.supportText}>
            Support: udaypareta645@gmail.com
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.divider} />

          <View style={styles.footerBrandRow}>
            <Image
              source={{
                uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
              }}
              style={styles.footerLogo}
              resizeMode="contain"
            />
            <Text style={styles.footerBrand}>UpWall</Text>
          </View>

          <Text style={styles.footerNote}>Clean • Curated • 2026</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  fixedBack: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: { flex: 1 },
  content: { paddingBottom: 20 },

  bannerContainer: { height: 380, width: "100%" },
  bannerImage: { ...StyleSheet.absoluteFillObject },
  bannerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 24,
    paddingBottom: 40,
  },
  bannerCategory: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },

  section: { padding: 24, paddingTop: 36 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#A0A0A0",
    letterSpacing: 1.5,
    marginBottom: 16,
  },

  developerCard: {
    marginHorizontal: 20,
    backgroundColor: "#000",
    borderRadius: 28,
    padding: 28,
    marginBottom: 32,
  },

  devHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },

  devIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  devLabel: {
    fontSize: 11,
    color: "#888",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },

  devName: {
    fontSize: 22,
    fontWeight: "900",
    color: "white",
  },

  devBio: {
    fontSize: 15,
    lineHeight: 24,
    color: "#bbb",
    marginBottom: 24,
  },

  devActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 14,
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000",
  },

  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },

  supportText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

  brandTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
    marginBottom: 14,
  },
  brandDesc: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4A4A4A",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  featureItem: {
    width: width / 2 - 26,
    backgroundColor: "#F7F7F7",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 12,
    color: "#777",
    lineHeight: 18,
  },

  textSection: { padding: 24, marginTop: 20 },
  bodyText: { fontSize: 15, lineHeight: 24, color: "#555" },

  roadmapSection: {
    padding: 24,
    backgroundColor: "#FBFBFB",
    marginVertical: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
  },
  roadmapRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  indicator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#000",
    marginRight: 15,
  },
  roadmapText: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },

  footer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  divider: {
    width: 30,
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 30,
  },
  footerBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  footerLogo: {
    width: 80,
    height: 80,
    opacity: 0.95,
  },
  footerBrand: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#000",
  },
  footerNote: {
    fontSize: 11,
    color: "#B0B0B0",
    marginTop: 6,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bottomSpacer: { height: 50 },
  devSection: {
    padding: 24,
    marginTop: 10,
    alignItems: "center",
  },

  devText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
    maxWidth: 300,
  },

  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 10,
  },

  contactButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  supportEmail: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
});
