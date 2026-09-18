import { Platform } from "react-native";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { requestWidgetUpdate } from "react-native-android-widget";
import { getCurrentQuote } from "../services/quotes";
import { showCurrentQuoteNotification } from "../services/quoteNotifications";
import { QuoteWidget } from "../widgets/QuoteWidget";

export const QUOTE_REFRESH_TASK = "upwalls-quote-refresh";

TaskManager.defineTask(QUOTE_REFRESH_TASK, async () => {
  if (Platform.OS !== "android") return BackgroundFetch.BackgroundFetchResult.NoData;
  try {
    const quote = await getCurrentQuote();
    await showCurrentQuoteNotification();
    await requestWidgetUpdate({ widgetName: "QuoteWidget", renderWidget: () => <QuoteWidget quote={quote} /> });
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Quote refresh failed:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
