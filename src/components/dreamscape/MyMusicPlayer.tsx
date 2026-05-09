import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Music2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
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

type Track = { name: string; src: string; coverIdx: number };

// Permanent internal tracks.
// Put your mp3 files in: `public/audio/` with these filenames (or change the `src` paths here).
const TRACKS: Track[] = [
  { name: "something about you", src: "/audio/song1.mp3", coverIdx: 0 },
  { name: "Fallen Star", src: "/audio/song2.mp3", coverIdx: 1 },
  { name: "Souvenir", src: "/audio/song3.mp3", coverIdx: 2 },
  { name: "Summer of Love", src: "/audio/song4.mp3", coverIdx: 3 },
  { name: "Lost in Japan", src: "/audio/song5.mp3", coverIdx: 4 },
  { name: "come down", src: "/audio/song6.mp3", coverIdx: 5 },
  { name: "Her Interlude", src: "/audio/song7.mp3", coverIdx: 6 },
  { name: "her eyes", src: "/audio/song8.mp3", coverIdx: 7 },
  { name: "2000s Pop Punk RnB", src: "/audio/song9.mp3", coverIdx: 8 },
  { name: "you said you were sorry", src: "/audio/song10.mp3", coverIdx: 9 },
  { name: "dream", src: "/audio/song11.mp3", coverIdx: 10 },
];

export const MyMusicPlayer = () => {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [vol, setVol] = useState(70);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { if (audioRef.current) audioRef.current.volume = vol / 100; }, [vol]);

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const upd = () => { setProgress(a.currentTime); setDuration(a.duration || 0); };
    a.addEventListener("timeupdate", upd);
    a.addEventListener("loadedmetadata", upd);
    return () => { a.removeEventListener("timeupdate", upd); a.removeEventListener("loadedmetadata", upd); };
  }, [idx]);

  const cur = TRACKS[idx];

  const toggle = async () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      try { await a.play(); setPlaying(true); }
      catch (e) { void e; }
    }
  };
  const skip = (d: number) => { setIdx((i) => (i + d + TRACKS.length) % TRACKS.length); setPlaying(false); };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <div className="dream-card rounded-2xl p-4 md:p-5 grain animate-fade-up">
      <audio ref={audioRef} src={cur.src} onEnded={() => skip(1)} />

      <div className="flex items-center gap-2 mb-4 text-cloud-pink">
        <Music2 className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">my mixtape</span>
      </div>

      {/* now playing */}
      <div className="flex gap-3 items-center mb-4">
        <img
          src={COVERS[cur.coverIdx]} alt="" width={64} height={64}
          className={`w-14 h-14 rounded-xl object-cover sticker-shadow ${playing ? "animate-spin-slow" : ""}`}
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <p className="font-hand text-cloud-lilac text-sm">song {idx + 1}</p>
          <h3 className="font-serif italic text-xl md:text-2xl text-paper truncate">{cur.name}</h3>
        </div>
      </div>

      <div className="mb-3">
        <Slider value={[progress]} max={duration || 100} step={0.1}
          onValueChange={([v]) => { if (audioRef.current) audioRef.current.currentTime = v; }} />
        <div className="flex justify-between text-[10px] text-paper/40 mt-1 font-sans">
          <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2.5 mb-3">
        <Button size="icon" variant="ghost" onClick={() => skip(-1)} className="text-paper hover:text-cloud-pink">
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          onClick={toggle}
          className="bg-cloud-pink hover:bg-bow text-ink rounded-full w-12 h-12"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => skip(1)} className="text-paper hover:text-cloud-pink">
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Volume2 className="w-4 h-4 text-paper/50" />
        <Slider value={[vol]} max={100} onValueChange={([v]) => setVol(v)} />
      </div>
    </div>
  );
};
