import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Music2, Upload, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cloudSync } from "@/lib/cloud-sync";
import cover1 from "@/assets/covers/cover-1.jpg";
import cover2 from "@/assets/covers/cover-2.jpg";
import cover3 from "@/assets/covers/cover-3.jpg";
import cover4 from "@/assets/covers/cover-4.jpg";
import cover5 from "@/assets/covers/cover-5.jpg";
import cover6 from "@/assets/covers/cover-6.jpg";
import cover7 from "@/assets/covers/cover-7.jpg";
import cover8 from "@/assets/covers/cover-8.jpg";
import cover9 from "@/assets/covers/cover-9.jpg";
import cover10 from "@/assets/covers/cover-10.jpg";
import cover11 from "@/assets/covers/cover-11.jpg";

const COVERS = [cover1, cover2, cover3, cover4, cover5, cover6, cover7, cover8, cover9, cover10, cover11];
const DEFAULT_NAMES = [
  "moon dust", "pink curtains", "lilac sky", "soft hills", "cassette love",
  "sakura night", "sleepy cat", "balloon flight", "ocean lull", "lavender tea",
  "lofi dream",
];
const PRESET_SRC: Record<number, string> = { 10: "/audio/lofi-dream.mp3" };
const KEY = "moonlit_my_songs_v2";
const SLOTS = 11;

interface Slot { name: string; src: string | null; }

const initial = (): Slot[] =>
  Array.from({ length: SLOTS }, (_, i) => ({ name: DEFAULT_NAMES[i], src: PRESET_SRC[i] ?? null }));

export const MyMusicPlayer = () => {
  const [slots, setSlots] = useState<Slot[]>(() => cloudSync.get<Slot[]>(KEY, initial()));
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // hydrate when user signs in
  useEffect(() => cloudSync.subscribe(KEY, () => setSlots(cloudSync.get<Slot[]>(KEY, initial()))), []);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = vol / 100; }, [vol]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const upd = () => { setProgress(a.currentTime); setDuration(a.duration || 0); };
    a.addEventListener("timeupdate", upd);
    a.addEventListener("loadedmetadata", upd);
    return () => { a.removeEventListener("timeupdate", upd); a.removeEventListener("loadedmetadata", upd); };
  }, [idx]);

  const persist = (next: Slot[]) => { setSlots(next); cloudSync.set(KEY, next); };

  const onUpload = (i: number, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...slots];
      next[i] = { ...next[i], src: reader.result as string };
      persist(next);
    };
    reader.readAsDataURL(file);
  };
  const clearSlot = (i: number) => {
    const next = [...slots];
    next[i] = { name: DEFAULT_NAMES[i], src: null };
    persist(next);
  };
  const renameSlot = (i: number, name: string) => {
    const next = [...slots]; next[i] = { ...next[i], name }; persist(next);
  };

  const cur = slots[idx];

  const toggle = async () => {
    const a = audioRef.current; if (!a || !cur.src) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { try { await a.play(); setPlaying(true); } catch {} }
  };
  const skip = (d: number) => {
    let i = idx;
    for (let k = 0; k < 10; k++) {
      i = (i + d + 10) % 10;
      if (slots[i].src) { setIdx(i); setPlaying(false); return; }
    }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <audio ref={audioRef} src={cur.src ?? undefined} onEnded={() => skip(1)} />

      <div className="flex items-center gap-2 mb-4 text-cloud-pink">
        <Music2 className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">my mixtape</span>
      </div>

      {/* now playing */}
      <div className="flex gap-4 items-center mb-5">
        <img
          src={COVERS[idx]} alt="" width={120} height={120}
          className={`w-28 h-28 rounded-xl object-cover sticker-shadow ${playing ? "animate-spin-slow" : ""}`}
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="font-hand text-cloud-lilac text-base">slot {idx + 1}</p>
          <h3 className="font-serif italic text-2xl text-paper truncate">{cur.name}</h3>
          <p className="font-sans text-xs text-paper/40 truncate">
            {cur.src ? "ready to play ✦" : "empty — upload a song below"}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <Slider value={[progress]} max={duration || 100} step={0.1}
          onValueChange={([v]) => { if (audioRef.current) audioRef.current.currentTime = v; }} />
        <div className="flex justify-between text-[10px] text-paper/40 mt-1 font-sans">
          <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <Button size="icon" variant="ghost" onClick={() => skip(-1)} className="text-paper hover:text-cloud-pink">
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button size="icon" onClick={toggle} disabled={!cur.src}
          className="bg-cloud-pink hover:bg-bow text-ink rounded-full w-14 h-14">
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => skip(1)} className="text-paper hover:text-cloud-pink">
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <Volume2 className="w-4 h-4 text-paper/50" />
        <Slider value={[vol]} max={100} onValueChange={([v]) => setVol(v)} />
      </div>

      {/* slot grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {slots.map((s, i) => (
          <div key={i}
            className={`relative group rounded-lg overflow-hidden border ${i === idx ? "border-cloud-pink" : "border-white/10"} bg-night-mid/40`}>
            <button onClick={() => { setIdx(i); setPlaying(false); }} className="block w-full">
              <img src={COVERS[i]} alt="" width={120} height={120} loading="lazy" className="w-full aspect-square object-cover" />
            </button>
            <div className="p-1.5">
              <input
                value={s.name}
                onChange={(e) => renameSlot(i, e.target.value)}
                className="w-full bg-transparent font-hand text-sm text-paper outline-none truncate"
              />
              <div className="flex items-center justify-between text-[10px] text-paper/50">
                <span>song {i + 1}</span>
                {s.src && (
                  <button onClick={() => clearSlot(i)} className="hover:text-destructive" title="remove">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            {!s.src && (
              <label className="absolute inset-0 grid place-items-center bg-night-deep/70 opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <Upload className="w-5 h-5 text-cloud-pink" />
                <input type="file" accept="audio/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(i, f); }} />
              </label>
            )}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-paper/40 font-sans mt-3 text-center">
        upload your own .mp3s · saved privately to your account
      </p>
    </div>
  );
};
