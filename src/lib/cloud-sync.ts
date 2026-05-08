// Tiny "cloud-backed localStorage": stores per-key JSON blobs in `user_data`.
// Falls back to localStorage only when signed-out. When the user signs in,
// we pull cloud data and overwrite local; on every save we push to cloud.

import { supabase } from "@/integrations/supabase/client";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, any>();
let currentUser: string | null = null;

const lsKey = (k: string) => `mlit:${k}`;

const notify = (k: string) => listeners.get(k)?.forEach((cb) => cb());

export const cloudSync = {
  async setUser(uid: string | null) {
    currentUser = uid;
    if (!uid) { cache.clear(); return; }
    // pull all rows
    const { data } = await supabase.from("user_data").select("key,value").eq("user_id", uid);
    cache.clear();
    (data ?? []).forEach((r: any) => cache.set(r.key, r.value));
    // notify everything
    listeners.forEach((_, k) => notify(k));
  },
  get<T = any>(key: string, fallback: T): T {
    if (currentUser) {
      return (cache.get(key) ?? fallback) as T;
    }
    try { const raw = localStorage.getItem(lsKey(key)); return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  },
  async set<T = any>(key: string, value: T) {
    if (currentUser) {
      cache.set(key, value);
      notify(key);
      await supabase.from("user_data").upsert({ user_id: currentUser, key, value: value as any });
    } else {
      localStorage.setItem(lsKey(key), JSON.stringify(value));
      notify(key);
    }
  },
  subscribe(key: string, cb: Listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(cb);
    return () => { listeners.get(key)?.delete(cb); };
  },
};
