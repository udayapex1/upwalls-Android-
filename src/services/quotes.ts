import quoteData from "../../assets/quotes/quotes.json";

export type Quote = {
  id: string;
  text: string;
  author?: string;
};

export const ROTATION_MS = 4 * 60 * 60 * 1000;

const quotes = quoteData as Quote[];

export async function getCurrentQuote(now = Date.now()): Promise<Quote> {
  const index = Math.floor(now / ROTATION_MS) % quotes.length;
  return quotes[index];
}
