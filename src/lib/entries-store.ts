import { cloudSync } from "./cloud-sync";

export interface Entry {
  id: string; kind: string; date: string; title?: string; body: string;
  meta?: Record<string, any>; createdAt: number;
}
const KEY = "moonlit_entries";
const read = (): Entry[] => cloudSync.get<Entry[]>(KEY, []);
const write = (e: Entry[]) => cloudSync.set(KEY, e);

export const entriesStore = {
  list: (kind?: string) => kind ? read().filter(e => e.kind === kind) : read(),
  save(e: Entry) {
    const all = read();
    const i = all.findIndex(x => x.id === e.id);
    if (i >= 0) all[i] = e; else all.unshift(e);
    write(all);
  },
  remove(id: string) { write(read().filter(e => e.id !== id)); },
  subscribe(cb: () => void) { return cloudSync.subscribe(KEY, cb); },
};

export const newId = () => crypto.randomUUID();
export const today = () => new Date().toISOString().slice(0, 10);
