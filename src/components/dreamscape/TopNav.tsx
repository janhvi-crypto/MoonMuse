import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export const TopNav = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = d.getHours() % 12 || 12;
      const m = d.getMinutes().toString().padStart(2, "0");
      const ap = d.getHours() >= 12 ? "PM" : "AM";
      setTime(`${h}:${m} ${ap}`);
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-6 font-sans text-paper/90">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-cloud-pink" />
        <span className="text-sm md:text-base tracking-[0.4em] font-medium">MOONLIT</span>
      </div>
      <div className="flex items-center gap-4 md:gap-6 text-xs tracking-[0.35em] text-paper/70">
        <span className="hidden md:flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-cloud-pink animate-twinkle" />
          {time}
        </span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">A QUIET PLACE</span>
      </div>
    </nav>
  );
};
