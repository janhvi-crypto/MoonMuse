import { useEffect, useState } from "react";
import { Star, Sparkles } from "lucide-react";

interface Wish { id: string; text: string; granted: boolean; }
const KEY = "sundown_wishes";

export const Wishlist = () => {
  const [wishes, setWishes] = useState<Wish[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  const [draft, setDraft] = useState("");

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(wishes)); }, [wishes]);

  const add = () => {
    if (!draft.trim()) return;
    setWishes([{ id: crypto.randomUUID(), text: draft, granted: false }, ...wishes]);
    setDraft("");
  };

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 mb-1 text-petal">
        <Sparkles className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">wishlist</span>
      </div>
      <h3 className="font-serif text-2xl text-paper mb-1">stars to wish on</h3>
      <p className="font-hand text-muted-foreground text-base mb-4">small dreams, kept close</p>

      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="flex gap-2 mb-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="i wish..."
          className="flex-1 bg-dusk-mid border border-border rounded-lg px-3 py-2 font-hand text-lg text-paper placeholder:text-muted-foreground/60 outline-none focus:border-sun transition-colors"
        />
        <button type="submit" className="bg-sun text-ink rounded-lg px-4 hover:bg-sun-glow transition-colors">
          <Star className="w-4 h-4" />
        </button>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {wishes.length === 0 && (
          <p className="font-hand text-lg text-muted-foreground text-center py-6">the sky is empty… make a wish</p>
        )}
        {wishes.map((w) => (
          <div key={w.id} className="flex items-center gap-3 p-3 rounded-lg bg-dusk-mid/60 group">
            <button
              onClick={() => setWishes(wishes.map((x) => x.id === w.id ? { ...x, granted: !x.granted } : x))}
              className="shrink-0"
            >
              <Star className={`w-5 h-5 transition-all ${w.granted ? "fill-sun text-sun" : "text-muted-foreground hover:text-sun"}`} />
            </button>
            <span className={`font-hand text-lg flex-1 ${w.granted ? "text-muted-foreground line-through" : "text-paper"}`}>
              {w.text}
            </span>
            <button onClick={() => setWishes(wishes.filter((x) => x.id !== w.id))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive text-xs transition-opacity">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
