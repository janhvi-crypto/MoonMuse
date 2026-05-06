// Shared store for "memories" — the saved diary pages.
// Persists to localStorage. Components subscribe via a tiny event bus.

export interface PlacedSticker {
  id: string;
  emoji: string;
  x: number; // 0-1 relative
  y: number;
  rotation: number;
  scale: number;
}

export interface Memory {
  id: string;
  date: string;        // ISO date
  title: string;
  body: string;
  mood: string;        // mood id
  stickers: PlacedSticker[];
  paperColor: "pink" | "cream" | "lilac";
  createdAt: number;
}

const KEY = "moonlit_memories";

const read = (): Memory[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
const write = (mems: Memory[]) => {
  localStorage.setItem(KEY, JSON.stringify(mems));
  window.dispatchEvent(new CustomEvent("memories:changed"));
};

export const memoryStore = {
  list: read,
  save(mem: Memory) {
    const all = read();
    const idx = all.findIndex((m) => m.id === mem.id);
    if (idx >= 0) all[idx] = mem;
    else all.unshift(mem);
    write(all);
  },
  remove(id: string) {
    write(read().filter((m) => m.id !== id));
  },
  subscribe(cb: () => void) {
    window.addEventListener("memories:changed", cb);
    return () => window.removeEventListener("memories:changed", cb);
  },
};
