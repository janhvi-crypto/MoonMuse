import { useEffect, useState } from "react";
import { BookHeart, ChevronLeft, ChevronRight } from "lucide-react";

const KEY = "sundown_diary";
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export const Diary = () => {
  const [date, setDate] = useState(today());
  const [entries, setEntries] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(entries)); }, [entries]);

  const move = (n: number) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + n);
    setDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 mb-1 text-petal">
        <BookHeart className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">dear diary</span>
      </div>
      <h3 className="font-serif text-2xl text-paper mb-4">a page each day</h3>

      <div className="flex items-center justify-between mb-3">
        <button onClick={() => move(-1)} className="text-paper hover:text-sun">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-hand text-2xl text-paper">{fmtDate(date)}</span>
        <button onClick={() => move(1)} disabled={date >= today()} className="text-paper hover:text-sun disabled:opacity-20">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="paper-card p-5 grain min-h-[260px] relative" style={{ backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, hsl(var(--ink) / 0.08) 31px, hsl(var(--ink) / 0.08) 32px), var(--gradient-paper)" }}>
        <p className="font-hand text-2xl text-ink/70 mb-2">Dear Diary,</p>
        <textarea
          value={entries[date] || ""}
          onChange={(e) => setEntries({ ...entries, [date]: e.target.value })}
          placeholder="today felt like..."
          className="w-full min-h-[200px] bg-transparent resize-none outline-none font-hand text-xl text-ink leading-8 placeholder:text-ink/30"
          style={{ lineHeight: "32px" }}
        />
      </div>
    </div>
  );
};
