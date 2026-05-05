import { useEffect, useState } from "react";
import { Feather, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Entry { id: string; text: string; date: string; }
const KEY = "sundown_journal";

export const Journal = () => {
  const [entries, setEntries] = useState<Entry[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  });
  const [draft, setDraft] = useState("");

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(entries)); }, [entries]);

  const save = () => {
    if (!draft.trim()) return;
    setEntries([{ id: crypto.randomUUID(), text: draft, date: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }, ...entries]);
    setDraft("");
  };

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 mb-1 text-petal">
        <Feather className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">thought dump</span>
      </div>
      <h3 className="font-serif text-2xl text-paper mb-1">let it out</h3>
      <p className="font-hand text-muted-foreground text-base mb-4">no one will read this but you</p>

      <div className="paper-card p-4 mb-3 grain">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="the bug that haunted me today..."
          className="w-full min-h-[100px] bg-transparent resize-none outline-none font-hand text-xl text-ink placeholder:text-ink/40"
        />
      </div>
      <Button onClick={save} className="w-full bg-sun text-ink hover:bg-sun-glow font-medium">
        keep this thought
      </Button>

      {entries.length > 0 && (
        <div className="mt-5 space-y-2 max-h-56 overflow-y-auto pr-2">
          {entries.map((e) => (
            <div key={e.id} className="paper-card p-3 grain group relative">
              <p className="font-hand text-lg text-ink/90 leading-snug whitespace-pre-wrap">{e.text}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-sans text-[10px] uppercase tracking-wider text-ink/50">{e.date}</span>
                <button onClick={() => setEntries(entries.filter((x) => x.id !== e.id))} className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-destructive transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
