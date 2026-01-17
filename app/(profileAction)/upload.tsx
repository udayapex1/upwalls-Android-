import TopNavbar from "@/src/components/TopNavbar";
import { uploadWallpaper } from "@/src/services/wallpapers";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Upload() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Abstract");
  const [tags, setTags] = useState("");
  const [deviceType, setDeviceType] = useState<"Mobile" | "Desktop">("Mobile");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Abstract",
    "Nature",
    "Minimal",
    "Technology",
    "Space",
    "Cars",
    "Anime",
    "Games",
    "Other",
  ];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !image) {
      Alert.alert("Error", "Please select an image");
      return;
    }
    if (currentStep === 2 && !title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    setIsLoading(true);

    try {
      const tagsArray = tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);
      
      const result = await uploadWallpaper(
        title,
        description,
        category,
        image,
        tagsArray,
        deviceType
      );

      if (result.success) {
        Alert.alert("Success", "Wallpaper uploaded successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(profileAction)/dashboard"),
          },
        ]);
      } else {
        Alert.alert("Upload Failed", result.error || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
          {currentStep > 1 ? (
            <Ionicons name="checkmark" size={14} color="#FFF" />
          ) : (
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
          )}
        </View>
        <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
          {currentStep > 2 ? (
            <Ionicons name="checkmark" size={14} color="#FFF" />
          ) : (
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
          )}
        </View>
        <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />
        <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
        </View>
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>Image</Text>
        <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>Details</Text>
        <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>Review</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Your Wallpaper</Text>
      <Text style={styles.stepSubtitle}>Choose a high-quality image for upload</Text>
      
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {image ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#FFF" />
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={64} color="#999" />
            <Text style={styles.placeholderText}>Tap to select image</Text>
            <Text style={styles.placeholderSubtext}>JPG, PNG • Max 10MB</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Wallpaper Details</Text>
      <Text style={styles.stepSubtitle}>Provide information about your wallpaper</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Neon City Lights"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Device Type *</Text>
          <View style={styles.deviceTypeContainer}>
            <TouchableOpacity
              style={[
                styles.deviceTypeOption,
                deviceType === "Mobile" && styles.deviceTypeOptionActive,
              ]}
              onPress={() => setDeviceType("Mobile")}
            >
              <Ionicons 
                name="phone-portrait-outline" 
                size={24} 
                color={deviceType === "Mobile" ? "#FFF" : "#666"} 
              />
              <Text
                style={[
                  styles.deviceTypeText,
                  deviceType === "Mobile" && styles.deviceTypeTextActive,
                ]}
              >
                Mobile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deviceTypeOption,
                deviceType === "Desktop" && styles.deviceTypeOptionActive,
              ]}
              onPress={() => setDeviceType("Desktop")}
            >
              <Ionicons 
                name="desktop-outline" 
                size={24} 
                color={deviceType === "Desktop" ? "#FFF" : "#666"} 
              />
              <Text
                style={[
                  styles.deviceTypeText,
                  deviceType === "Desktop" && styles.deviceTypeTextActive,
                ]}
              >
                Desktop
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoryContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="dark, nature, 4k (comma separated)"
            placeholderTextColor="#999"
            value={tags}
            onChangeText={setTags}
          />
        </View> */}
        
        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about this wallpaper..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View> */}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review & Upload</Text>
      <Text style={styles.stepSubtitle}>Confirm your wallpaper details before uploading</Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewImageContainer}>
          <Image source={{ uri: image! }} style={styles.reviewImage} />
        </View>

        <View style={styles.reviewDetails}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Title</Text>
            <Text style={styles.reviewValue}>{title}</Text>
          </View>

          <View style={styles.reviewDivider} />

          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Device Type</Text>
            <View style={styles.reviewBadge}>
              <Ionicons 
                name={deviceType === "Mobile" ? "phone-portrait" : "desktop"} 
                size={14} 
                color="#FFF" 
              />
              <Text style={styles.reviewBadgeText}>{deviceType}</Text>
            </View>
          </View>

          <View style={styles.reviewDivider} />

          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Category</Text>
            <Text style={styles.reviewValue}>{category}</Text>
          </View>

          {tags && (
            <>
              <View style={styles.reviewDivider} />
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Tags</Text>
                <Text style={styles.reviewValue}>{tags}</Text>
              </View>
            </>
          )}

          {description && (
            <>
              <View style={styles.reviewDivider} />
              <View style={styles.reviewColumn}>
                <Text style={styles.reviewLabel}>Description</Text>
                <Text style={styles.reviewValueDescription}>{description}</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <TopNavbar title="Upload Wallpaper" showLogo={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.mainContent}>
          {renderStepIndicator()}

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 120 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </ScrollView>

          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color="#FFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < 3 ? (
              <TouchableOpacity
                style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>
                  {currentStep === 1 ? "Continue" : "Next"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, isLoading && styles.uploadButtonDisabled]}
                onPress={handleUpload}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.uploadButtonText}>Upload Now</Text>
                    <Ionicons name="cloud-upload" size={20} color="#FFF" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepIndicatorContainer: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
  },
  stepNumberActive: {
    color: "#FFF",
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#e5e5e5",
  },
  stepLineActive: {
    backgroundColor: "#000",
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    flex: 1,
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#000",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#777",
    marginBottom: 28,
  },
  imagePicker: {
    width: "100%",
    height: 400,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e5e5e5",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  imagePreviewContainer: {
    flex: 1,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  changeImageText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderWidth: 2,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    padding: 16,
    fontSize: 15,
    color: "#000",
  },
  textArea: {
    minHeight: 100,
  },
  categoryContainer: {
    gap: 10,
    paddingRight: 20,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#e5e5e5",
  },
  categoryChipActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  deviceTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  deviceTypeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    gap: 10,
  },
  deviceTypeOptionActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  deviceTypeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#999",
  },
  deviceTypeTextActive: {
    color: "#FFF",
  },
  reviewCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    overflow: "hidden",
  },
  reviewImageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#FFF",
  },
  reviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  reviewDetails: {
    padding: 20,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewColumn: {
    gap: 8,
  },
  reviewLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  reviewValueDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  reviewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reviewBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 16,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    padding: 20,
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#e5e5e5",
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#000",
    borderRadius: 8,
    gap: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#000",
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});