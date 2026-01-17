import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface UpdateCheckResult {
    hasUpdate: boolean;
    latestVersion: string;
    currentVersion: string;
    storeUrl?: string;
    message?: string;
}

const isUpdateAvailable = (current: string, latest: string): boolean => {
    const c = current.split(".").map(Number);
    const l = latest.split(".").map(Number);

    for (let i = 0; i < l.length; i++) {
        if ((l[i] || 0) > (c[i] || 0)) return true;
        if ((l[i] || 0) < (c[i] || 0)) return false;
    }
    return false;
};

export const checkForUpdates = async (): Promise<UpdateCheckResult> => {
    const currentVersion = Constants.expoConfig?.version || "1.0.0";
    const platform = Platform.OS; // "android" | "ios"

    try {
        const res = await axios.get(
            "https://upwall-fullstack-e9qy.onrender.com/api/versioninfo/version",
            {
                params: { platform }
            }
        );

        const data = res.data?.data;

        if (!data) {
            throw new Error("Invalid version response");
        }

        const hasUpdate = isUpdateAvailable(
            currentVersion,
            data.latestVersion
        );

        return {
            hasUpdate,
            latestVersion: data.latestVersion,
            currentVersion,
            storeUrl: data.downloadUrl,
            message: data.message
        };
    } catch (error) {
        console.log("Update check failed:", error);

        // Fail-safe: never block app on error
        return {
            hasUpdate: false,
            latestVersion: currentVersion,
            currentVersion
        };
    }
};
