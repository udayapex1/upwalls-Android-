import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { getCurrentQuote } from "../services/quotes";
import { QuoteWidget } from "./QuoteWidget";

export async function widgetTaskHandler({ widgetInfo, widgetAction, renderWidget }: WidgetTaskHandlerProps): Promise<void> {
  if (widgetInfo.widgetName !== "QuoteWidget") return;
  if (widgetAction === "WIDGET_ADDED" || widgetAction === "WIDGET_UPDATE" || widgetAction === "WIDGET_RESIZED") renderWidget(<QuoteWidget quote={await getCurrentQuote()} />);
}
