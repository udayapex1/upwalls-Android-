import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const BACKEND_URL = "https://upwall-fullstack-e9qy.onrender.com"
// export const BACKEND_URL = "https://upwall-fullstack.onrender.com"


export const loginUser = async (
  email: string,
  password: string
) => {
  try {
    const { data } = await axios.post(
      `${BACKEND_URL}/api/users/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(data)
    // 🔐 store token securely
    await SecureStore.setItemAsync("token", data.token);
    await SecureStore.setItemAsync("user", JSON.stringify(data.user));

    return { success: true, user: data.user, token: data.token };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        "Login failed",
    };
  }
};

export const registerUser = async (
  email: string,
  password: string,
  userName: string,
  profilePhoto: string
) => {
  try {
    // Backend requires profile photo, so it should always be provided
    if (!profilePhoto) {
      throw new Error("Profile photo is required");
    }

    let formData = new FormData();

    formData.append("email", email);
    formData.append("password", password);
    formData.append("userName", userName);

    // Since we compress to JPEG, use .jpg extension and JPEG MIME type
    const filename = "photo.jpg";
    const mimeType = "image/jpeg";

    // For React Native FormData, the file object structure is critical
    // Ensure URI is properly formatted
    let fileUri = profilePhoto;
    // Remove file:// prefix if present (some React Native versions need it, others don't)
    if (fileUri.startsWith("file://")) {
      // Keep it for React Native FormData
    }

    const fileObject: any = {
      uri: fileUri,
      type: mimeType,
      name: filename,
    };

    // Backend expects field name "profile" (not "photo")
    formData.append("profile", fileObject);

    // Debug: Log FormData contents (be careful not to log sensitive data)
    console.log("Preparing registration request:", {
      email,
      userName,
      hasPhoto: !!profilePhoto,
      fieldName: "profile",
      filename,
      mimeType,
      uriLength: fileUri.length,
      uriStart: fileUri.substring(0, 30),
    });

    // Use fetch instead of axios for better FormData handling in React Native
    console.log("Sending registration request to:", `${BACKEND_URL}/api/users/register`);

    const response = await fetch(`${BACKEND_URL}/api/users/register`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        // Don't set Content-Type - fetch will set it automatically with boundary
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    // 🔐 store token securely
    await SecureStore.setItemAsync("token", data.token);
    await SecureStore.setItemAsync("user", JSON.stringify(data.user));

    return { success: true, user: data.user, token: data.token };
  } catch (error: any) {
    console.error("Registration error:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    // Provide more specific error messages
    let errorMessage = "Registration failed";
    if (error.message?.includes("Network") || error.message?.includes("fetch")) {
      errorMessage = "Network error. Please check your internet connection and try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

export const getStoredAuth = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    const userStr = await SecureStore.getItemAsync("user");

    if (!token || !userStr) {
      return null;
    }

    return {
      token,
      user: JSON.parse(userStr),
    };
  } catch (error) {
    console.error("Error getting stored auth:", error);
    return null;
  }
};

export const getUserProfile = async (token: string) => {
  try {
    if (!token) {
      console.log("No token provided for profile fetch");
      return null;
    }

    console.log("Fetching user profile with token:", token.substring(0, 20) + "...");

    const { data } = await axios.get(`${BACKEND_URL}/api/users/myProfile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("User profile API response:", JSON.stringify(data, null, 2));

    // Update stored user data with fresh profile data
    // Handle both direct user object or nested user object
    const userData = data?.user || data;
    if (userData) {
      console.log("Storing user data:", JSON.stringify(userData, null, 2));
      await SecureStore.setItemAsync("user", JSON.stringify(userData));
      return { user: userData };
    }

    return data;
  } catch (error: any) {
    console.error("Error fetching user profile:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return null;
  }
};

export const clearStoredAuth = async () => {
  try {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
  } catch (error) {
    console.error("Error clearing stored auth:", error);
  }
};
