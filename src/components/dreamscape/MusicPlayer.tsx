import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const tracks = [
  { title: "lo-fi dream", artist: "ambient sketches", src: "/audio/lofi-dream.mp3" },
];

export const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const [vol, setVol] = useState(60);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = vol / 100;
  }, [vol]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const upd = () => { setProgress(a.currentTime); setDuration(a.duration || 0); };
    a.addEventListener("timeupdate", upd);
    a.addEventListener("loadedmetadata", upd);
    return () => {
      a.removeEventListener("timeupdate", upd);
      a.removeEventListener("loadedmetadata", upd);
    };
  }, [idx]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { await a.play(); setPlaying(true); }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const t = tracks[idx];

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <audio
        ref={audioRef}
        src={t.src}
        loop
        onEnded={() => setIdx((i) => (i + 1) % tracks.length)}
      />
      <div className="flex items-center gap-2 mb-4 text-sun">
        <Music className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">now playing</span>
      </div>
      <h3 className="font-serif text-2xl text-paper mb-1">{t.title}</h3>
      <p className="font-hand text-petal text-lg mb-5">{t.artist}</p>

      <div className="mb-4">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={0.1}
          onValueChange={([v]) => { if (audioRef.current) audioRef.current.currentTime = v; }}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-sans">
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-5">
        <Button size="icon" variant="ghost" onClick={() => setIdx((i) => (i - 1 + tracks.length) % tracks.length)} className="text-paper hover:text-sun">
          <SkipBack className="w-5 h-5" />
        </Button>
        <Button size="icon" onClick={toggle} className="bg-sun hover:bg-sun-glow text-ink rounded-full w-14 h-14 sun-glow">
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setIdx((i) => (i + 1) % tracks.length)} className="text-paper hover:text-sun">
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider value={[vol]} max={100} onValueChange={([v]) => setVol(v)} />
      </div>
    </div>
  );
};
