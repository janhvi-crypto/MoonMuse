import { useEffect, useState } from "react";
import { Wind } from "lucide-react";

const cycle = ["breathe in", "hold", "breathe out", "hold"];
const durations = [4000, 2000, 6000, 2000];

export const BreathingOrb = () => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) % 4), durations[phase]);
    return () => clearTimeout(t);
  }, [phase, active]);

  const scale = phase === 0 ? 1.5 : phase === 1 ? 1.5 : phase === 2 ? 0.8 : 0.8;

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up flex flex-col items-center">
      <div className="flex items-center gap-2 mb-1 text-petal self-start">
        <Wind className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">breathe</span>
      </div>
      <h3 className="font-serif text-2xl text-paper self-start mb-6">soften the day</h3>

      <div className="relative h-52 w-52 flex items-center justify-center my-2">
        <div
          className="absolute rounded-full bg-gradient-to-br from-sun-glow to-ember"
          style={{
            width: "120px",
            height: "120px",
            transform: `scale(${active ? scale : 1})`,
            transition: `transform ${active ? durations[phase] : 1500}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            boxShadow: "0 0 80px hsl(var(--sun) / 0.6), 0 0 40px hsl(var(--sun-glow) / 0.5)",
          }}
        />
        <div
          className="absolute rounded-full border border-sun/30"
          style={{
            width: "200px", height: "200px",
            transform: `scale(${active ? scale * 0.9 : 1})`,
            transition: `transform ${active ? durations[phase] : 1500}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />
      </div>

      <p className="font-hand text-2xl text-paper h-10 mt-2">
        {active ? cycle[phase] : "press to begin"}
      </p>

      <button
        onClick={() => { setActive((a) => !a); setPhase(0); }}
        className="mt-3 text-xs uppercase tracking-[0.3em] text-sun hover:text-sun-glow font-sans transition-colors"
      >
        {active ? "rest" : "start"}
      </button>
    </div>
  );
};
