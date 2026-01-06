import { Colors } from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const compressImage = async (uri: string) => {
    try {
      // Resize and compress the image to reduce file size
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 500 } }], // Resize to max 500px width (smaller for faster upload)
        {
          compress: 0.6, // Compress to 60% quality (more compression)
          format: ImageManipulator.SaveFormat.JPEG, // Convert to JPEG for smaller size
        }
      );
      console.log("Image compressed:", {
        original: uri.substring(0, 50),
        compressed: manipulatedImage.uri.substring(0, 50),
        width: manipulatedImage.width,
        height: manipulatedImage.height,
      });
      return manipulatedImage.uri;
    } catch (error) {
      console.error("Error compressing image:", error);
      return uri; // Return original if compression fails
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your photos to set a profile picture."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Compress the image before setting it
      const compressedUri = await compressImage(result.assets[0].uri);
      setProfilePhoto(compressedUri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need access to your camera to take a photo."
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // Compress the image before setting it
      const compressedUri = await compressImage(result.assets[0].uri);
      setProfilePhoto(compressedUri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      "Profile Photo",
      "Choose an option",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleRegister = async () => {
    if (!email || !password || !userName) {
      Alert.alert("Error", "All fields required");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Backend requires profile photo
    if (!profilePhoto) {
      Alert.alert("Error", "Please select a profile photo");
      return;
    }

    setLoading(true);
    const res = await register(email, password, userName, profilePhoto);
    setLoading(false);

    if (!res.success) {
      Alert.alert("Registration Failed", res.error || "An error occurred");
      return;
    }

    // Navigation is handled automatically by AuthContext
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Image Section */}
        <View style={styles.bannerContainer}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dwemivxbp/image/upload/v1767450687/Screenshot_from_2026-01-03_20-00-01_hbajx8.png",
            }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
            style={styles.bannerOverlay}
          />
          <View style={styles.bannerContent}>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)")}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            {/* <Text style={styles.bannerTitle}>Create Account</Text> */}
            <Text style={styles.bannerSubtitle}>Join us today</Text>
          </View>
        </View>

        {/* Registration Form Section */}
        <View style={styles.formContainer}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>
              Fill in your details to get started
            </Text>
          </View>

          {/* Profile Photo Upload */}
          <View style={styles.profilePhotoContainer}>
            <TouchableOpacity
              onPress={showImagePickerOptions}
              style={styles.profilePhotoButton}
              activeOpacity={0.8}
            >
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.profilePhotoPlaceholder}>
                  <Ionicons name="camera" size={32} color={Colors.textSecondary} />
                  <Text style={styles.profilePhotoText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.profilePhotoEdit}>
                <Ionicons
                  name={profilePhoto ? "create" : "camera"}
                  size={18}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputsSection}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Username"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                value={userName}
                onChangeText={setUserName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#000", "#1a1a1a"]}
              style={styles.registerButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            style={styles.loginButton}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>
              Already have an account?{" "}
              <Text style={styles.loginButtonTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bannerContainer: {
    height: 300,
    position: "relative",
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "black",
    marginTop: 20,
    letterSpacing: -0.5,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    fontWeight: "400",
  },
  formContainer: {
    padding: 24,
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "400",
  },
  profilePhotoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profilePhotoButton: {
    position: "relative",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.border,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  profilePhotoText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  profilePhotoEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.textPrimary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  inputsSection: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  loginButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loginButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginButtonTextBold: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});