import TopNavbar from "@/src/components/TopNavbar";
import { Colors } from "@/src/constants/color";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Report() {
  const insets = useSafeAreaInsets();
  const [reportType, setReportType] = useState<"bug" | "content" | "other">("bug");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Missing Information", "Please describe the issue you are facing.");
      return;
    }

    Keyboard.dismiss();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Report Submitted",
        "Thank you for your feedback! We will review your report shortly.",
        [{ text: "OK", onPress: () => setDescription("") }]
      );
    }, 1500);
  };

  const reportTypes = [
    { id: "bug", label: "App Bug", icon: "bug-outline" },
    { id: "content", label: "Bad Content", icon: "alert-circle-outline" },
    { id: "other", label: "Other", icon: "help-circle-outline" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <TopNavbar
        title="Report Issue"
        logoSource={{
          uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {/* Header Info */}
              <View style={styles.headerCard}>
                <View >
                  <Image 
                    source={{ uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767461573/Gemini_Generated_Image_wlp3otwlp3otwlp3-removebg-preview_sviab7.png" }}
                    style={{ width: 150, height: 150 }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.headerTitle}>Something went wrong?</Text>
                <Text style={styles.headerSubtitle}>
                  Let us know what happened so we can fix it.
                </Text>
              </View>

              {/* Report Type Selection */}
              <Text style={styles.sectionLabel}>What kind of issue is it?</Text>
              <View style={styles.typeContainer}>
                {reportTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      reportType === type.id && styles.typeButtonActive,
                    ]}
                    onPress={() => setReportType(type.id as any)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={reportType === type.id ? Colors.textPrimary : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        reportType === type.id && styles.typeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description Input */}
              <Text style={styles.sectionLabel}>Describe the issue</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Please provide as much detail as possible..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={6}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>

              {/* Email Input (Optional) */}
              <Text style={styles.sectionLabel}>Contact Email (Optional)</Text>
              <View style={styles.inputSingleContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!description.trim() || isSubmitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!description.trim() || isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Report</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    marginBottom: 32,
    marginTop: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ef4444" + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ef4444" + "30",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.textSecondary,
    textAlign: "center",
    maxWidth: "80%",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  typeButtonActive: {
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  typeLabelActive: {
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  textArea: {
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
  },
  inputSingleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 32,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    height: "100%",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background,
  },
});
