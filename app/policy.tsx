import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Policy() {
  const insets = useSafeAreaInsets();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      icon: "information-circle",
      title: "Information We Collect",
      content: [
        "We collect information to provide and improve our services.",
        "• Account Information: username, email address, and profile photo (optional).",
        "• User Preferences: selected interests or categories (e.g., OLED, Nature, Minimal).",
        "• Technical Data: device type, operating system, app version, and unique installation identifiers.",
        "• Usage Data: wallpapers viewed, downloaded, liked, or shared inside the app.",
        "• Push Notification Token: used only to deliver notifications you opt into.",
        "",
        "We do NOT collect phone numbers, contacts, messages, IMEI numbers, or personal files from your device.",
      ],
    },
    {
      icon: "settings",
      title: "How We Use Your Data",
      content: [
        "• To create and manage your account.",
        "• To personalize wallpaper recommendations based on your interests.",
        "• To send push notifications about new wallpapers or collections.",
        "• To improve app performance, stability, and user experience.",
        "• To provide customer support and respond to queries.",
      ],
    },
    {
      icon: "notifications",
      title: "Push Notifications",
      content: [
        "UpWalls may send push notifications only if you allow notification permissions and select interests inside the app.",
        "",
        "You can disable notifications anytime from your device settings.",
      ],
    },
    {
      icon: "analytics",
      title: "Analytics & Install Tracking",
      content: [
        "We collect anonymous analytics data such as app installs, active users, and feature usage to understand how the app is used and to improve our services.",
        "",
        "This data does not personally identify you.",
      ],
    },
    {
      icon: "pricetag",
      title: "Ads & Monetization",
      content: [
        "Currently, UpWalls does not display advertisements.",
        "",
        "In the future, ads or premium features may be introduced. If ads are added, they will comply with Google Play policies and will not sell your personal data.",
      ],
    },
    {
      icon: "shield-checkmark",
      title: "Data Security",
      content: [
        "We use reasonable technical and organizational measures to protect your data against unauthorized access, loss, or misuse. However, no method of transmission over the internet is 100% secure.",
      ],
    },
    {
      icon: "time",
      title: "Data Retention",
      content: [
        "We retain your data only as long as necessary to provide our services or as required by law. You may request deletion of your account at any time.",
      ],
    },
    {
      icon: "people",
      title: "Children's Privacy",
      content: [
        "UpWalls is not intended for children under the age of 13. We do not knowingly collect personal data from children.",
      ],
    },
    {
      icon: "refresh",
      title: "Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time. Any changes will be posted within the app. Continued use of the app means you accept the updated policy.",
      ],
    },
    {
      icon: "mail",
      title: "Contact Us",
      content: [
        "If you have any questions about this Privacy Policy, please contact us at:",
        "",
        "support@upwalls.com",
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <TopNavbar
        logoSource={{
          uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
        }}
        title="Privacy Policy"
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="shield-checkmark" size={48} color={Colors.textPrimary} />
          </View>
          <Text style={styles.heading}>Privacy Policy</Text>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.dateText}>Effective Date: January 14, 2026</Text>
          </View>
          <Text style={styles.intro}>
            Welcome to UpWalls. Your privacy is important to us. This Privacy Policy
            explains how we collect, use, store, and protect your information when you
            use the UpWalls mobile application.
          </Text>
          <View style={styles.agreementBox}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.textPrimary} />
            <Text style={styles.agreementText}>
              By using UpWalls, you agree to the practices described in this policy.
            </Text>
          </View>
        </View>

        {/* Expandable Sections */}
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sectionCard}
            activeOpacity={0.8}
            onPress={() => toggleSection(index)}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name={section.icon as any} size={20} color={Colors.textPrimary} />
                </View>
                <Text style={styles.sectionTitle}>
                  {index + 1}. {section.title}
                </Text>
              </View>
              <Ionicons
                name={expandedSections.has(index) ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.textSecondary}
              />
            </View>

            {expandedSections.has(index) && (
              <View style={styles.sectionContent}>
                {section.content.map((line, lineIndex) => (
                  <Text key={lineIndex} style={styles.contentText}>
                    {line}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            Last updated: January 14, 2026
          </Text>
          <Text style={styles.footerSubtext}>
            We're committed to protecting your privacy and ensuring transparency.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  intro: {
    fontSize: 15,
    fontWeight: "400",
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 16,
  },
  agreementBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  contentText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.textSecondary,
    textAlign: "center",
  },
});