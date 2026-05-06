import { useEffect, useState } from "react";
import { Sparkles, Trash2, BookOpen } from "lucide-react";
import { memoryStore, type Memory } from "@/lib/memory-store";
import { MOODS } from "@/lib/stickers";

const PAPER_BG = {
  pink: "linear-gradient(160deg, hsl(340 70% 96%), hsl(320 60% 90%))",
  cream: "linear-gradient(160deg, hsl(35 55% 96%), hsl(340 50% 92%))",
  lilac: "linear-gradient(160deg, hsl(280 60% 95%), hsl(260 50% 88%))",
} as const;

export const MemoryShelf = ({ onOpen }: { onOpen: (m: Memory) => void }) => {
  const [memories, setMemories] = useState<Memory[]>(memoryStore.list());

  useEffect(() => memoryStore.subscribe(() => setMemories(memoryStore.list())), []);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 grain animate-fade-up">
      <div className="flex items-center gap-2 text-cloud-lilac mb-1">
        <Sparkles className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.35em]">your memory shelf</span>
      </div>
      <h3 className="font-serif italic text-3xl md:text-4xl text-paper mb-1">little nights, kept</h3>
      <p className="font-hand text-cloud-pink text-xl mb-6">tap any page to open it again</p>

      {memories.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-10 h-10 mx-auto text-paper/30 mb-3" />
          <p className="font-hand text-2xl text-paper/60">the shelf is empty… write your first page tonight</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {memories.map((m, i) => {
            const mood = MOODS.find((x) => x.id === m.mood);
            const rotate = (i % 2 === 0 ? -1 : 1) * (1 + (i % 3));
            return (
              <div key={m.id} className="group relative" style={{ transform: `rotate(${rotate}deg)` }}>
                <button
                  onClick={() => onOpen(m)}
                  className="block w-full text-left rounded-xl p-4 sticker-shadow hover:scale-105 transition-transform"
                  style={{ background: PAPER_BG[m.paperColor], minHeight: 200 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-hand text-base text-ink/60">
                      {new Date(m.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-2xl">{mood?.emoji}</span>
                  </div>
                  <h4 className="font-serif italic text-lg text-ink mb-2 line-clamp-2">
                    {m.title || "untitled night"}
                  </h4>
                  <p className="font-hand text-base text-ink/70 line-clamp-4 leading-snug">
                    {m.body || "…"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {m.stickers.slice(0, 5).map((s) => (
                      <span key={s.id} className="text-base">{s.emoji}</span>
                    ))}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("forget this memory?")) memoryStore.remove(m.id);
                  }}
                  className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-night-deep text-paper rounded-full w-7 h-7 flex items-center justify-center transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
