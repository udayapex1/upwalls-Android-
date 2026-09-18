import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getCurrentQuote } from "./quotes";

type NotifeeModule = typeof import("@notifee/react-native");
let notifeeModule: NotifeeModule | null = null;

function getNotifee(): NotifeeModule | null {
  // Expo Go does not ship Notifee's native module. Lazy loading keeps Expo Go
  // and iOS startup-safe while native Android builds still use Notifee.
  if (Platform.OS !== "android" || Constants.executionEnvironment === "storeClient") return null;
  if (!notifeeModule) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notifeeModule = require("@notifee/react-native") as NotifeeModule;
  }
  return notifeeModule;
}

const ENABLED_KEY = "quote_notification_enabled";
const CHANNEL_ID = "upwalls-quotes";
const NOTIFICATION_ID = "upwalls-current-quote";

export async function isQuoteNotificationEnabled(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  return (await SecureStore.getItemAsync(ENABLED_KEY)) === "true";
}

export async function setQuoteNotificationEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS !== "android") return;
  await SecureStore.setItemAsync(ENABLED_KEY, String(enabled));
  const notifee = getNotifee();
  if (!notifee) return;
  if (enabled) {
    await notifee.default.requestPermission();
    await showCurrentQuoteNotification();
  } else {
    await notifee.default.cancelNotification(NOTIFICATION_ID);
  }
}

export async function showCurrentQuoteNotification(): Promise<void> {
  const notifee = getNotifee();
  if (!notifee || !(await isQuoteNotificationEnabled())) return;
  const quote = await getCurrentQuote();
  const channelId = await notifee.default.createChannel({
    id: CHANNEL_ID,
    name: "UpWalls quotes",
    importance: notifee.AndroidImportance.LOW,
    visibility: notifee.AndroidVisibility.PUBLIC,
    vibration: false,
  });
  await notifee.default.displayNotification({
    id: NOTIFICATION_ID,
    title: "A thought for today",
    body: quote.author ? `${quote.text} — ${quote.author}` : quote.text,
    android: {
      channelId,
      smallIcon: "ic_launcher",
      importance: notifee.AndroidImportance.LOW,
      visibility: notifee.AndroidVisibility.PUBLIC,
      ongoing: true,
      autoCancel: false,
      pressAction: { id: "default", launchActivity: "default" },
    },
  });
}

export async function disableQuoteNotification(): Promise<void> {
  if (Platform.OS !== "android") return;
  await SecureStore.setItemAsync(ENABLED_KEY, "false");
  const notifee = getNotifee();
  if (notifee) await notifee.default.cancelNotification(NOTIFICATION_ID);
}
