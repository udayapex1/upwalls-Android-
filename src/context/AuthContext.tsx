import { clearStoredAuth, getStoredAuth, getUserProfile, loginUser, registerUser } from "@/src/services/auth";
import { router, useSegments } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type UserData = {
  _id: string;
  email: string;
  userName: string;
  profile?: {
    public_id: string;
    url: string;
  };
  photo?: {
    public_id: string;
    url: string;
  };
  createdAt?: string;
};

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, userName: string, profilePhoto: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();

  // Compute authentication status
  const isAuthenticated = !!user && !!token;

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle navigation based on auth state
  // Only redirect authenticated users away from auth pages
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    // If user is authenticated and on auth pages, redirect to home
    if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
    // Allow unauthenticated users to browse freely - no redirect to login
  }, [isAuthenticated, isLoading, segments]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const storedAuth = await getStoredAuth();
      
      if (storedAuth && storedAuth.token) {
        // Set initial user and token from storage
        setUser(storedAuth.user);
        setToken(storedAuth.token);
        
        // Fetch fresh profile data from API
        console.log("Checking auth status - fetching user profile...");
        const profileData = await getUserProfile(storedAuth.token);
        
        if (profileData) {
          // Handle both nested { user: {...} } and direct user object
          const userData = profileData.user || profileData;
          if (userData && userData._id) {
            setUser(userData);
            console.log("User profile updated from API:", JSON.stringify(userData, null, 2));
          } else {
            console.log("Profile API returned invalid data, using stored user data");
          }
        } else {
          // If API call fails, keep stored user data
          console.log("Profile API call failed, using stored user data");
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        
        // Fetch fresh profile after login
        console.log("Login successful - fetching user profile...");
        const profileData = await getUserProfile(result.token);
        if (profileData && profileData.user) {
          setUser(profileData.user);
          console.log("User profile updated after login:", JSON.stringify(profileData.user, null, 2));
        } else if (profileData) {
          // Handle direct user object
          setUser(profileData as any);
          console.log("User profile updated after login (direct object)");
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error || "Login failed" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  };

  const register = async (email: string, password: string, userName: string, profilePhoto: string) => {
    try {
      const result = await registerUser(email, password, userName, profilePhoto);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        
        // Fetch fresh profile after registration
        console.log("Registration successful - fetching user profile...");
        const profileData = await getUserProfile(result.token);
        if (profileData && profileData.user) {
          setUser(profileData.user);
          console.log("User profile updated after registration:", JSON.stringify(profileData.user, null, 2));
        } else if (profileData) {
          // Handle direct user object
          setUser(profileData as any);
          console.log("User profile updated after registration (direct object)");
        }
        
        return { success: true };
      } else {
        return { success: false, error: result.error || "Registration failed" };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
      };
    }
  };

  const logout = async () => {
    try {
      await clearStoredAuth();
      setUser(null);
      setToken(null);
      // Redirect to home after logout instead of login
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still clear state even if storage clear fails
      setUser(null);
      setToken(null);
      router.replace("/(tabs)");
    }
  };

  const refreshUser = async () => {
    try {
      const storedAuth = await getStoredAuth();
      if (storedAuth && storedAuth.token) {
        // Fetch fresh profile data from API
        console.log("Refreshing user profile...");
        const profileData = await getUserProfile(storedAuth.token);
        
        if (profileData && profileData.user) {
          setUser(profileData.user);
          setToken(storedAuth.token);
          console.log("User profile refreshed successfully");
        } else {
          // Fallback to stored data if API fails
          setUser(storedAuth.user);
          setToken(storedAuth.token);
          console.log("Profile refresh failed, using stored data");
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

