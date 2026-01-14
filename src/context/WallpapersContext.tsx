import { getAllWallpapers, getUserWallpapers, getWallpaperById, Wallpaper } from "@/src/services/wallpapers";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface WallpapersContextType {
  userWallpapers: Wallpaper[];
  allWallpapers: Wallpaper[];
  isLoading: boolean;
  userWallpapersCount: number;
  refreshUserWallpapers: () => Promise<void>;
  refreshAllWallpapers: () => Promise<void>;
  getWallpaper: (id: string) => Promise<Wallpaper | null>;
}

const WallpapersContext = createContext<WallpapersContextType | undefined>(undefined);

export function WallpapersProvider({ children }: { children: ReactNode }) {
  const [userWallpapers, setUserWallpapers] = useState<Wallpaper[]>([]);
  const [allWallpapers, setAllWallpapers] = useState<Wallpaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const userWallpapersCount = userWallpapers.length;

  // Fetch user wallpapers when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserWallpapers();
    } else {
      // Clear user wallpapers when not authenticated
      setUserWallpapers([]);
    }
  }, [isAuthenticated]);

  // Fetch all wallpapers on mount
  useEffect(() => {
    refreshAllWallpapers();
  }, []);

  const refreshUserWallpapers = async () => {
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping user wallpapers fetch");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Refreshing user wallpapers...");
      const wallpapers = await getUserWallpapers();
      setUserWallpapers(wallpapers);
      console.log(`Loaded ${wallpapers.length} user wallpapers`);
    } catch (error) {
      console.error("Error refreshing user wallpapers:", error);
      setUserWallpapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAllWallpapers = async () => {
    try {
      setIsLoading(true);
      console.log("Refreshing all wallpapers...");
      const wallpapers = await getAllWallpapers();
      setAllWallpapers(wallpapers);
      console.log(`Loaded ${wallpapers.length} wallpapers`);
    } catch (error) {
      console.error("Error refreshing all wallpapers:", error);
      setAllWallpapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getWallpaper = async (id: string): Promise<Wallpaper | null> => {
    try {
      console.log("Fetching wallpaper:", id);
      const wallpaper = await getWallpaperById(id);
      return wallpaper;
    } catch (error) {
      console.error("Error fetching wallpaper:", error);
      return null;
    }
  };

  const value: WallpapersContextType = {
    userWallpapers,
    allWallpapers,
    isLoading,
    userWallpapersCount,
    refreshUserWallpapers,
    refreshAllWallpapers,
    getWallpaper,
  };

  return (
    <WallpapersContext.Provider value={value}>
      {children}
    </WallpapersContext.Provider>
  );
}

export function useWallpapers() {
  const context = useContext(WallpapersContext);
  if (context === undefined) {
    throw new Error("useWallpapers must be used within a WallpapersProvider");
  }
  return context;
}

