// Sticker library — each entry maps to a region in the generated stickers.png sprite.
// We use individual emoji + svg combo for crisp scalability.

export interface StickerDef {
  id: string;
  emoji: string;
  label: string;
  color?: string;
}

export const STICKERS: StickerDef[] = [
  { id: "moon", emoji: "🌙", label: "moon" },
  { id: "star", emoji: "✨", label: "sparkle" },
  { id: "heart-pink", emoji: "💗", label: "heart" },
  { id: "heart-purple", emoji: "💜", label: "heart" },
  { id: "flower", emoji: "🌸", label: "blossom" },
  { id: "daisy", emoji: "🌼", label: "daisy" },
  { id: "cloud", emoji: "☁️", label: "cloud" },
  { id: "rainbow", emoji: "🌈", label: "rainbow" },
  { id: "tea", emoji: "🍵", label: "tea" },
  { id: "cassette", emoji: "📼", label: "tape" },
  { id: "camera", emoji: "📷", label: "camera" },
  { id: "letter", emoji: "💌", label: "letter" },
  { id: "ribbon", emoji: "🎀", label: "bow" },
  { id: "cherry", emoji: "🍒", label: "cherry" },
  { id: "planet", emoji: "🪐", label: "planet" },
  { id: "sleep", emoji: "😴", label: "sleepy" },
  { id: "cry", emoji: "🥺", label: "soft" },
  { id: "smile", emoji: "🥰", label: "loved" },
  { id: "candle", emoji: "🕯️", label: "candle" },
  { id: "book", emoji: "📖", label: "book" },
];

export const WASHI_TAPES = [
  "linear-gradient(45deg, hsl(335 80% 80% / 0.85) 0 6px, hsl(340 90% 88% / 0.85) 6px 12px)",
  "linear-gradient(45deg, hsl(280 50% 75% / 0.85) 0 6px, hsl(280 60% 85% / 0.85) 6px 12px)",
  "linear-gradient(90deg, hsl(48 90% 80% / 0.8), hsl(335 80% 80% / 0.8))",
];

export const MOODS = [
  { id: "soft", emoji: "🌸", label: "soft" },
  { id: "tired", emoji: "🌙", label: "tired" },
  { id: "dreamy", emoji: "✨", label: "dreamy" },
  { id: "blue", emoji: "💧", label: "blue" },
  { id: "warm", emoji: "🍵", label: "warm" },
  { id: "alive", emoji: "🌈", label: "alive" },
];
