import "expo-router/entry";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { Platform } from "react-native";
import { widgetTaskHandler } from "./src/widgets/widgetTaskHandler";

if (Platform.OS === "android") registerWidgetTaskHandler(widgetTaskHandler);
