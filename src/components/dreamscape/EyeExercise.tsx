import { useEffect, useRef, useState } from "react";
import { Eye, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = { name: string; instruction: string; duration: number; motion: string };

const STEPS: Step[] = [
  { name: "20-20-20", instruction: "look at something 20 feet away · soften the gaze", duration: 20, motion: "rest" },
  { name: "blink softly", instruction: "slow gentle blinks · let your eyes water", duration: 15, motion: "blink" },
  { name: "follow the moon →", instruction: "eyes only · keep your head still", duration: 12, motion: "horizontal" },
  { name: "follow the moon ↑", instruction: "look up · then down · slowly", duration: 12, motion: "vertical" },
  { name: "circle the sky", instruction: "draw a slow circle with your eyes", duration: 16, motion: "circle" },
  { name: "palm & rest", instruction: "rub palms warm · cup over closed eyes", duration: 30, motion: "palm" },
];

export const EyeExercise = () => {
  const [i, setI] = useState(0);
  const [t, setT] = useState(STEPS[0].duration);
  const [running, setRunning] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setT(prev => {
        if (prev > 1) return prev - 1;
        setI(p => (p + 1) % STEPS.length);
        return STEPS[(i + 1) % STEPS.length].duration;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running, i]);

  const reset = () => { setRunning(false); setI(0); setT(STEPS[0].duration); };
  const step = STEPS[i];

  // Movement of the orb
  const motionStyle: React.CSSProperties =
    step.motion === "horizontal" ? { animation: "eyeH 4s ease-in-out infinite" } :
    step.motion === "vertical"   ? { animation: "eyeV 4s ease-in-out infinite" } :
    step.motion === "circle"     ? { animation: "eyeC 5s linear infinite" } :
    step.motion === "blink"      ? { animation: "eyeBlink 2s ease-in-out infinite" } :
    {};

  return (
    <div className="glass-panel rounded-3xl p-6 grain animate-fade-up">
      <style>{`
        @keyframes eyeH { 0%,100%{transform:translateX(-80px)} 50%{transform:translateX(80px)} }
        @keyframes eyeV { 0%,100%{transform:translateY(-50px)} 50%{transform:translateY(50px)} }
        @keyframes eyeC { 0%{transform:rotate(0) translateX(60px) rotate(0)} 100%{transform:rotate(360deg) translateX(60px) rotate(-360deg)} }
        @keyframes eyeBlink { 0%,40%,60%,100%{opacity:1;transform:scaleY(1)} 50%{opacity:.2;transform:scaleY(.1)} }
      `}</style>
      <div className="flex items-center gap-2 text-cloud-pink mb-1">
        <Eye className="w-4 h-4" />
        <span className="font-pixel text-[10px] uppercase tracking-[0.35em]">eye exercise</span>
      </div>
      <h3 className="font-serif italic text-2xl md:text-3xl text-paper mb-3">rest your screen-eyes</h3>

      <div className="relative h-48 rounded-2xl bg-night-deep/60 border border-cloud-pink/15 overflow-hidden flex items-center justify-center mb-4">
        <div
          className="w-10 h-10 rounded-full bg-cloud-pink sticker-shadow"
          style={{ ...motionStyle, boxShadow: "0 0 30px hsl(var(--cloud-pink) / 0.7)" }}
        />
        <div className="absolute bottom-2 left-0 right-0 text-center">
          <p className="font-pixel text-[10px] tracking-[0.3em] text-cloud-pink">{step.name.toUpperCase()}</p>
          <p className="font-hand text-lg text-paper/85">{step.instruction}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-2 rounded-full bg-night-soft/60 overflow-hidden">
          <div
            className="h-full bg-cloud-pink transition-all duration-1000"
            style={{ width: `${(1 - t / step.duration) * 100}%` }}
          />
        </div>
        <span className="font-pixel text-paper/70 text-sm w-8 text-right">{t}s</span>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setRunning(r => !r)} className="flex-1 bg-cloud-pink text-ink hover:bg-bow">
          {running ? <><Pause className="w-4 h-4 mr-2" />pause</> : <><Play className="w-4 h-4 mr-2" />begin</>}
        </Button>
        <Button variant="ghost" onClick={reset} className="text-paper/70 hover:text-paper">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-1 mt-3 justify-center">
        {STEPS.map((_, idx) => (
          <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-cloud-pink" : "w-1.5 bg-paper/20"}`} />
        ))}
      </div>
    </div>
  );
};
