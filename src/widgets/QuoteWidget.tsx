import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { Quote } from "../services/quotes";

export function QuoteWidget({ quote }: { quote: Quote }) {
  return (
    <FlexWidget clickAction="OPEN_APP" style={{ width: "match_parent", height: "match_parent", padding: 20, backgroundColor: "#172554", borderRadius: 20, justifyContent: "center" }}>
      <TextWidget text="UPWALLS • DAILY THOUGHT" style={{ color: "#93c5fd", fontSize: 11, fontWeight: "bold" }} />
      <TextWidget text={`“${quote.text}”`} maxLines={4} style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold", marginTop: 10 }} />
      {quote.author ? <TextWidget text={`— ${quote.author}`} maxLines={1} style={{ color: "#bfdbfe", fontSize: 12, marginTop: 10 }} /> : null}
    </FlexWidget>
  );
}
