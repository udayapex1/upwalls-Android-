import { Colors } from "@/src/constants/color";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "All fields required");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      Alert.alert("Login Failed", res.error || "An error occurred");
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
            <Text style={styles.bannerSubtitle}>Sign in to continue</Text>
          </View>
        </View>

        {/* Login Form Section */}
        <View style={styles.formContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>
              Sign in to continue to your account
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputsSection}>
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
                returnKeyType="next"
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
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#000", "#1a1a1a"]}
              style={styles.loginButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/register")}
            style={styles.registerButton}
            activeOpacity={0.7}
          >
            <Text style={styles.registerButtonText}>
              Don't have an account?{" "}
              <Text style={styles.registerButtonTextBold}>Register</Text>
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
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loginButtonDisabled: {
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
  registerButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  registerButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerButtonTextBold: {
    fontWeight: "700",
    color: Colors.textPrimary,
  },
});