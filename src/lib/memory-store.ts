// Memories store — backed by cloudSync (cloud when signed-in, local fallback otherwise).
import { cloudSync } from "./cloud-sync";

export interface PlacedSticker {
  id: string; emoji: string; x: number; y: number; rotation: number; scale: number;
}
export interface Memory {
  id: string; date: string; title: string; body: string; mood: string;
  stickers: PlacedSticker[]; paperColor: "pink" | "cream" | "lilac"; createdAt: number;
}

const KEY = "moonlit_memories";
const read = (): Memory[] => cloudSync.get<Memory[]>(KEY, []);
const write = (m: Memory[]) => cloudSync.set(KEY, m);

export const memoryStore = {
  list: read,
  save(mem: Memory) {
    const all = read();
    const i = all.findIndex((m) => m.id === mem.id);
    if (i >= 0) all[i] = mem; else all.unshift(mem);
    write(all);
  },
  remove(id: string) { write(read().filter((m) => m.id !== id)); },
  subscribe(cb: () => void) { return cloudSync.subscribe(KEY, cb); },
};
