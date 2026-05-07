import { useEffect, useRef, useState } from "react";
import { Flower2, Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Pose { name: string; emoji: string; cue: string; duration: number; }

const FLOWS: Record<string, Pose[]> = {
  "desk relief": [
    { name: "neck rolls", emoji: "🧖‍♀️", cue: "drop chin · slow circle each way", duration: 40 },
    { name: "shoulder shrugs", emoji: "💆", cue: "lift to ears · drop heavy", duration: 30 },
    { name: "seated twist", emoji: "🌀", cue: "exhale · twist right · then left", duration: 45 },
    { name: "wrist circles", emoji: "✋", cue: "ten each way · slow & soft", duration: 30 },
    { name: "forward fold", emoji: "🌿", cue: "fold over knees · let arms hang", duration: 45 },
    { name: "deep rest", emoji: "🌙", cue: "hands on heart · three soft breaths", duration: 30 },
  ],
  "spine soften": [
    { name: "cat-cow", emoji: "🐈", cue: "inhale arch · exhale round", duration: 60 },
    { name: "child's pose", emoji: "🌸", cue: "knees wide · forehead to floor", duration: 60 },
    { name: "thread the needle", emoji: "🧵", cue: "right arm under · then switch", duration: 60 },
    { name: "downward dog", emoji: "🐕", cue: "pedal feet · soften shoulders", duration: 45 },
    { name: "savasana", emoji: "✨", cue: "lie back · let the day go", duration: 60 },
  ],
  "evening calm": [
    { name: "legs up the wall", emoji: "🦵", cue: "let gravity do the work", duration: 90 },
    { name: "supine twist", emoji: "🌀", cue: "knees right · gaze left", duration: 45 },
    { name: "happy baby", emoji: "👶", cue: "hold feet · sway side to side", duration: 45 },
    { name: "butterfly fold", emoji: "🦋", cue: "soles together · fold forward", duration: 60 },
    { name: "deep rest", emoji: "🌙", cue: "let the moon hold you", duration: 60 },
  ],
};

export const YogaBreak = () => {
  const flows = Object.keys(FLOWS);
  const [flow, setFlow] = useState(flows[0]);
  const poses = FLOWS[flow];
  const [i, setI] = useState(0);
  const [t, setT] = useState(poses[0].duration);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => { setI(0); setT(FLOWS[flow][0].duration); setRunning(false); }, [flow]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setT(prev => {
        if (prev > 1) return prev - 1;
        const next = i + 1;
        if (next >= poses.length) { setRunning(false); return 0; }
        setI(next);
        return poses[next].duration;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, i, poses]);

  const skip = () => {
    const next = (i + 1) % poses.length;
    setI(next); setT(poses[next].duration);
  };
  const reset = () => { setRunning(false); setI(0); setT(poses[0].duration); };
  const pose = poses[i];

  return (
    <div className="glass-panel rounded-3xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 text-cloud-pink mb-1">
        <Flower2 className="w-4 h-4" />
        <span className="font-pixel text-[10px] uppercase tracking-[0.35em]">yoga break</span>
      </div>
      <h3 className="font-serif italic text-2xl md:text-3xl text-paper mb-3">stretch the day out of you</h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {flows.map(f => (
          <button
            key={f}
            onClick={() => setFlow(f)}
            className={`px-2.5 py-1 rounded-full text-xs font-pixel tracking-wider transition-all ${
              f === flow ? "bg-cloud-pink text-ink scale-105 sticker-shadow" : "bg-night-soft/60 text-paper/70 hover:text-paper"
            }`}
          >
            ✦ {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-night-deep/60 border border-cloud-pink/15 p-5 text-center mb-4">
        <div className="text-6xl mb-2 animate-breathe inline-block">{pose.emoji}</div>
        <p className="font-serif italic text-2xl text-paper">{pose.name}</p>
        <p className="font-hand text-xl text-cloud-lilac mt-1">{pose.cue}</p>
        <p className="font-pixel text-[11px] tracking-[0.3em] text-cloud-pink mt-3">{t}s</p>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2 rounded-full bg-night-soft/60 overflow-hidden">
          <div
            className="h-full bg-cloud-pink transition-all duration-1000"
            style={{ width: `${(1 - t / pose.duration) * 100}%` }}
          />
        </div>
        <span className="font-pixel text-paper/60 text-xs">{i + 1}/{poses.length}</span>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setRunning(r => !r)} className="flex-1 bg-cloud-pink text-ink hover:bg-bow">
          {running ? <><Pause className="w-4 h-4 mr-2" />pause</> : <><Play className="w-4 h-4 mr-2" />flow</>}
        </Button>
        <Button variant="ghost" onClick={skip} className="text-paper/70 hover:text-paper" title="next pose">
          <SkipForward className="w-4 h-4" />
        </Button>
        <Button variant="ghost" onClick={reset} className="text-paper/70 hover:text-paper">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
