// Local-only storage. Each user's device keeps its own private data — never
// uploaded to any server. Same API surface as before so nothing else has to change.

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const lsKey = (k: string) => `mlit:${k}`;
const notify = (k: string) => listeners.get(k)?.forEach((cb) => cb());

export const cloudSync = {
  async setUser(_uid: string | null) { /* no-op, kept for compatibility */ },
  get<T = any>(key: string, fallback: T): T {
    try { const raw = localStorage.getItem(lsKey(key)); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  },
  async set<T = any>(key: string, value: T) {
    try { localStorage.setItem(lsKey(key), JSON.stringify(value)); } catch {}
    notify(key);
  },
  subscribe(key: string, cb: Listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(cb);
    return () => { listeners.get(key)?.delete(cb); };
  },
};
