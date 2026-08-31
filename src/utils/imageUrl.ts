/** Return a safe remote image URL or undefined for missing/invalid values. */
export const resolveImageUrl = (value?: string | null): string | undefined => {
  if (!value || typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("http://")) return `https://${trimmed.slice(7)}`;
  if (trimmed.startsWith("https://")) return trimmed;
  return undefined;
};
