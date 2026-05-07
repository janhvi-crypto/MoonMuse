import { useEffect, useState } from "react";
import { Heart, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { entriesStore, newId, today, type Entry } from "@/lib/entries-store";
import { toast } from "sonner";

const MOODS = [
  { e: "🌸", l: "soft" },
  { e: "✨", l: "dreamy" },
  { e: "🌙", l: "tired" },
  { e: "💧", l: "blue" },
  { e: "🍵", l: "cozy" },
  { e: "🌈", l: "alive" },
  { e: "🥺", l: "tender" },
  { e: "🥰", l: "loved" },
];

export const MoodTracker = () => {
  const [list, setList] = useState<Entry[]>([]);
  const [mood, setMood] = useState("🌸");
  const [note, setNote] = useState("");

  useEffect(() => {
    const refresh = () => setList(entriesStore.list("mood"));
    refresh();
    return entriesStore.subscribe(refresh);
  }, []);

  const log = () => {
    entriesStore.save({
      id: newId(), kind: "mood", date: today(),
      body: note, meta: { mood }, createdAt: Date.now(),
    });
    toast.success("mood logged 💗");
    setNote("");
  };

  return (
    <div className="glass-panel rounded-3xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 text-cloud-pink mb-1">
        <Heart className="w-4 h-4" />
        <span className="font-pixel text-[10px] uppercase tracking-[0.35em]">mood tracker</span>
      </div>
      <h3 className="font-serif italic text-2xl md:text-3xl text-paper mb-4">how is your heart?</h3>

      <div className="flex flex-wrap gap-2 mb-3">
        {MOODS.map(m => (
          <button
            key={m.l}
            onClick={() => setMood(m.e)}
            className={`text-3xl transition-all ${mood === m.e ? "scale-125 drop-shadow-lg" : "opacity-50 hover:opacity-100"}`}
            title={m.l}
          >{m.e}</button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="a sentence about today…"
        className="w-full min-h-[80px] rounded-2xl bg-paper/5 border border-cloud-pink/20 p-3 font-hand text-xl text-paper placeholder:text-paper/40 outline-none resize-none focus:border-cloud-pink/50"
      />

      <Button onClick={log} className="w-full mt-3 bg-cloud-pink text-ink hover:bg-bow">
        <Save className="w-4 h-4 mr-2" /> log this mood
      </Button>

      {list.length > 0 && (
        <div className="mt-5">
          <p className="font-pixel text-[9px] tracking-[0.3em] text-cloud-pink mb-2">RECENT ✦</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {list.slice(0, 12).map(e => (
              <div key={e.id} className="flex items-center gap-2 text-sm bg-night-soft/30 rounded-xl px-3 py-1.5 group">
                <span className="text-xl">{e.meta?.mood}</span>
                <span className="font-pixel text-[9px] text-paper/60 tracking-wider">{e.date}</span>
                <span className="font-hand text-lg text-paper/80 truncate">{e.body || "—"}</span>
                <button
                  onClick={() => entriesStore.remove(e.id)}
                  className="ml-auto opacity-0 group-hover:opacity-100 text-paper/40 hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
