import { filterMobileWallpapers } from "@/src/utils/wallpaperFilter";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { BACKEND_URL } from "./auth";

export type Wallpaper = {
  _id: string;
  title?: string;
  description?: string;
  image?: {
    public_id: string;
    url: string;
  };
  wallpaperImage?: {
    public_id: string;
    url: string;
  };
  category?: string;
  tags?: string[];
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
};

// Get user's uploaded wallpapers
export const getUserWallpapers = async (): Promise<Wallpaper[]> => {
  console.log("Fetching user wallpapers...");
  try {
    const token = await SecureStore.getItemAsync("token");

    if (!token) {
      console.log("No token found for fetching user wallpapers");
      return [];
    }

    console.log("Fetching user wallpapers...");
    console.log("Token:", token);

    const { data } = await axios.get(`${BACKEND_URL}/api/wallpaper/myPost`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log("test response:", data);


    // console.log("User wallpapers API response:", JSON.stringify(data, null, 2));

    // Handle both array response and nested response
    if (Array.isArray(data)) {
      return data;
    } else if (data.wallpapers && Array.isArray(data.wallpapers)) {
      return data.wallpapers;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  } catch (error: any) {
    console.error("Error fetching user wallpapers:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return [];
  }
};

// Get all wallpapers (for explore page)
export const getAllWallpapers = async (): Promise<Wallpaper[]> => {
  try {
    // console.log("Fetching all wallpapers from:", `${BACKEND_URL}/api/wallpaper/getAllPosts`);

    const { data } = await axios.get(`${BACKEND_URL}/api/wallpaper/getAllPosts`);

    // console.log("All wallpapers API response type:", typeof data);
    // console.log("All wallpapers API response:", JSON.stringify(data, null, 2));

    // Handle different response structures
    let wallpapers: any[] = [];

    if (Array.isArray(data)) {
      wallpapers = data;
      console.log("Response is direct array, length:", wallpapers.length);
    } else if (data && typeof data === 'object') {
      // Try various nested structures
      if (Array.isArray(data.wallpapers)) {
        wallpapers = data.wallpapers;
        console.log("Found wallpapers in data.wallpapers, length:", wallpapers.length);
      } else if (Array.isArray(data.data)) {
        wallpapers = data.data;
        console.log("Found wallpapers in data.data, length:", wallpapers.length);
      } else if (Array.isArray(data.posts)) {
        wallpapers = data.posts;
        console.log("Found wallpapers in data.posts, length:", wallpapers.length);
      } else if (data.success && Array.isArray(data.data)) {
        wallpapers = data.data;
        console.log("Found wallpapers in data.data (success), length:", wallpapers.length);
      } else {
        console.log("Unknown response structure, keys:", Object.keys(data));
      }
    }

    // Log first wallpaper structure for debugging
    if (wallpapers.length > 0) {
      console.log("First wallpaper structure:", JSON.stringify(wallpapers[0], null, 2));
      console.log("First wallpaper image:", wallpapers[0].image);
    }

    // Filter to only show mobile wallpapers
    const mobileWallpapers = filterMobileWallpapers(wallpapers);
    console.log(`Filtered ${mobileWallpapers.length} mobile wallpapers from ${wallpapers.length} total`);

    return mobileWallpapers;
  } catch (error: any) {
    console.error("Error fetching all wallpapers:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
    return [];
  }
};

// Get wallpaper by ID
export const getWallpaperById = async (id: string): Promise<Wallpaper | null> => {
  // Try multiple endpoint patterns based on getAllPosts pattern
  const endpoints = [
    `${BACKEND_URL}/api/wallpaper/getPost/${id}`,
    `${BACKEND_URL}/api/wallpaper/${id}`,
    `${BACKEND_URL}/api/wallpapers/${id}`,
    `${BACKEND_URL}/api/wallpaper/post/${id}`,
  ];

  for (const endpoint of endpoints) {
    try {
      console.log("Trying endpoint:", endpoint);
      const { data } = await axios.get(endpoint);

      console.log("Wallpaper by ID API response:", JSON.stringify(data, null, 2));

      // Handle different response structures
      if (data && typeof data === 'object') {
        // Try various nested structures
        if (data.wallpaper) {
          console.log("Found wallpaper in data.wallpaper");
          return data.wallpaper;
        } else if (data.data) {
          console.log("Found wallpaper in data.data");
          return data.data;
        } else if (data.post) {
          console.log("Found wallpaper in data.post");
          return data.post;
        } else if (data._id) {
          // Direct wallpaper object
          console.log("Found direct wallpaper object");
          return data;
        }
      }

      console.log("No wallpaper found in response structure");
    } catch (error: any) {
      console.log(`Endpoint ${endpoint} failed:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      // Continue to next endpoint
      continue;
    }
  }

  console.error("All endpoints failed for wallpaper ID:", id);
  return null;
};

// Upload a new wallpaper
export const uploadWallpaper = async (
  title: string,
  description: string,
  category: string,
  imageUri: string,
  tags: string[] = [],
  deviceType: "Mobile" | "Desktop" = "Mobile"
): Promise<{ success: boolean; error?: string; wallpaper?: Wallpaper }> => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("deviceSupport", deviceType);

    formData.append("tags", JSON.stringify(tags));

    const filename = imageUri.split("/").pop() || "upload.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const fileObject: any = {
      uri: imageUri,
      name: filename,
      type,
    };

    formData.append("wallpaperImage", fileObject);

    console.log("Uploading wallpaper to:", `${BACKEND_URL}/api/wallpaper/createPost`);

    const response = await fetch(`${BACKEND_URL}/api/wallpaper/createPost`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }

    console.log("Upload successful:", data);
    return { success: true, wallpaper: data.wallpaper || data };
  } catch (error: any) {
    console.error("Error uploading wallpaper:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
};

