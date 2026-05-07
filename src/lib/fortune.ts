// Deterministic daily fortune generator — different reading per zodiac per day
// but stable across refreshes on the same day.

export const ZODIACS = [
  { id: "aries", name: "Aries", symbol: "♈", dates: "Mar 21 – Apr 19" },
  { id: "taurus", name: "Taurus", symbol: "♉", dates: "Apr 20 – May 20" },
  { id: "gemini", name: "Gemini", symbol: "♊", dates: "May 21 – Jun 20" },
  { id: "cancer", name: "Cancer", symbol: "♋", dates: "Jun 21 – Jul 22" },
  { id: "leo", name: "Leo", symbol: "♌", dates: "Jul 23 – Aug 22" },
  { id: "virgo", name: "Virgo", symbol: "♍", dates: "Aug 23 – Sep 22" },
  { id: "libra", name: "Libra", symbol: "♎", dates: "Sep 23 – Oct 22" },
  { id: "scorpio", name: "Scorpio", symbol: "♏", dates: "Oct 23 – Nov 21" },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", dates: "Nov 22 – Dec 21" },
  { id: "capricorn", name: "Capricorn", symbol: "♑", dates: "Dec 22 – Jan 19" },
  { id: "aquarius", name: "Aquarius", symbol: "♒", dates: "Jan 20 – Feb 18" },
  { id: "pisces", name: "Pisces", symbol: "♓", dates: "Feb 19 – Mar 20" },
];

const LOVE = [
  "A gentle emotional shift is approaching. Someone may think about you more deeply than they admit. Soft conversations bring clarity today.",
  "An old feeling resurfaces sweetly. Trust the slow ones — they tend to mean it more.",
  "Your softness is a magnet today. Let yourself be adored without shrinking.",
  "A look held a beat too long is not your imagination. Receive it.",
  "Tonight is for honest words said quietly. Someone is listening more than you think.",
];
const MONEY = [
  "Small opportunities appear unexpectedly. Avoid impulsive spending; something prettier and more meaningful is coming soon.",
  "A pause before purchase saves you twice. Pretty things will wait — and arrive cheaper.",
  "Your creative ideas are quietly profitable. Write them down before they drift.",
  "An unexpected return finds its way to you. Stay patient with the post.",
  "Money loves your calm hands today. Plan softly, spend slower.",
];
const STUDY = [
  "Your focus grows stronger during evening hours. Creative work and aesthetic projects receive extra inspiration today.",
  "Mornings are foggy; afternoons sparkle. Save the hard thinking for after tea.",
  "A small finished thing matters more than a large unfinished one. Close one loop today.",
  "Your eye for beauty is sharp — let it lead the work.",
  "Teachers and elders are kinder than they sound. Ask the question.",
];
const FUTURE = [
  "A new phase is quietly beginning. Trust intuitive feelings and signs around you.",
  "Doors open inwards now. Tend to your own room first.",
  "What is leaving was never yours to keep. Wave at it gently.",
  "The next chapter has soft edges. You'll like who you become in it.",
  "A small daily ritual will grow into the year's quiet miracle.",
];
const COLORS = ["Blush Pink ♡", "Lavender Mist ✦", "Pearl Cream ☾", "Baby Blue ✧", "Soft Plum ♡"];
const SYMBOLS = [
  "ribbons • stars • strawberries • pearls",
  "moons • cherries • silk • teacups",
  "daisies • clouds • envelopes • bows",
  "candles • feathers • cassettes • lockets",
  "petals • lace • fireflies • diaries",
];

// Tiny string hash → integer
const hash = (s: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const pick = <T,>(arr: T[], seed: number, off: number) => arr[(seed + off) % arr.length];

export const dailyFortune = (zodiac: string, dateISO: string) => {
  const s = hash(zodiac + ":" + dateISO);
  return {
    love: pick(LOVE, s, 0),
    money: pick(MONEY, s, 1),
    study: pick(STUDY, s, 2),
    future: pick(FUTURE, s, 3),
    color: pick(COLORS, s, 4),
    symbols: pick(SYMBOLS, s, 5),
  };
};

// --- TAROT ---
export interface TarotCard {
  name: string;
  symbol: string;
  meaning: string;
}
export const TAROT: TarotCard[] = [
  { name: "The Star", symbol: "✧", meaning: "Hope, healing, romantic renewal." },
  { name: "The Empress", symbol: "♡", meaning: "Abundance, beauty, feminine energy, creative success." },
  { name: "The Moon", symbol: "☾", meaning: "Hidden emotions, intuition, mysterious connection." },
  { name: "The Lovers", symbol: "♥", meaning: "A meaningful choice. Two paths becoming one." },
  { name: "The Sun", symbol: "☀", meaning: "Joy, clarity, a warm day after a long week." },
  { name: "The High Priestess", symbol: "☽", meaning: "Trust the quiet voice. Secrets revealed gently." },
  { name: "The World", symbol: "✦", meaning: "A cycle completes. You did the thing." },
  { name: "The Magician", symbol: "✶", meaning: "You have the tools. Begin the spell." },
  { name: "Wheel of Fortune", symbol: "✺", meaning: "Luck turns in your favor. Be ready to receive." },
  { name: "The Hermit", symbol: "✧", meaning: "Solitude as medicine. Light your own lantern." },
  { name: "Strength", symbol: "♡", meaning: "Soft power. Tame the loud thing with kindness." },
  { name: "Temperance", symbol: "✦", meaning: "Balance returns. Mix the day with care." },
];

export const drawTarot = (n: number, seed = Date.now()): TarotCard[] => {
  const arr = [...TAROT].sort(() => (Math.sin(seed++) + 1) - 1).sort(() => Math.random() - 0.5);
  return arr.slice(0, n);
};

export const todayPretty = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
