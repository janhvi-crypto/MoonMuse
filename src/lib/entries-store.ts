// Generic localStorage store for saveable entry types
// (mood, dream, manifestation, wishlist, etc.)

export interface Entry {
  id: string;
  kind: string;        // "mood" | "dream" | "manifest" | ...
  date: string;        // ISO date
  title?: string;
  body: string;
  meta?: Record<string, any>;
  createdAt: number;
}

const KEY = "moonlit_entries";

const read = (): Entry[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
const write = (e: Entry[]) => {
  localStorage.setItem(KEY, JSON.stringify(e));
  window.dispatchEvent(new CustomEvent("entries:changed"));
};

export const entriesStore = {
  list: (kind?: string) => kind ? read().filter(e => e.kind === kind) : read(),
  save(e: Entry) {
    const all = read();
    const idx = all.findIndex(x => x.id === e.id);
    if (idx >= 0) all[idx] = e; else all.unshift(e);
    write(all);
  },
  remove(id: string) { write(read().filter(e => e.id !== id)); },
  subscribe(cb: () => void) {
    window.addEventListener("entries:changed", cb);
    return () => window.removeEventListener("entries:changed", cb);
  },
};

export const newId = () => crypto.randomUUID();
export const today = () => new Date().toISOString().slice(0, 10);
