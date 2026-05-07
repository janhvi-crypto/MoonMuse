import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, BookHeart, Star, Sparkles, Moon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { memoryStore, type Memory } from "@/lib/memory-store";
import { entriesStore, type Entry } from "@/lib/entries-store";

interface Wish { id: string; text: string; granted: boolean; createdAt?: number; }
const WISH_KEY = "sundown_wishes";

const readWishes = (): Wish[] => {
  try { return JSON.parse(localStorage.getItem(WISH_KEY) || "[]"); } catch { return []; }
};

const wishDate = (w: Wish) =>
  w.createdAt ? new Date(w.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

export const MemoryCalendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [memories, setMemories] = useState<Memory[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    const refreshAll = () => {
      setMemories(memoryStore.list());
      setEntries(entriesStore.list());
      setWishes(readWishes());
    };
    refreshAll();
    const u1 = memoryStore.subscribe(refreshAll);
    const u2 = entriesStore.subscribe(refreshAll);
    const onStorage = () => setWishes(readWishes());
    window.addEventListener("storage", onStorage);
    return () => { u1(); u2(); window.removeEventListener("storage", onStorage); };
  }, []);

  // Index by ISO date
  const byDate = useMemo(() => {
    const m: Record<string, { diary: Memory[]; manifest: Entry[]; dream: Entry[]; mood: Entry[]; wishes: Wish[] }> = {};
    const get = (d: string) => (m[d] ||= { diary: [], manifest: [], dream: [], mood: [], wishes: [] });
    memories.forEach(x => get(x.date).diary.push(x));
    entries.forEach(e => {
      const b = get(e.date);
      if (e.kind === "manifest") b.manifest.push(e);
      else if (e.kind === "dream") b.dream.push(e);
      else if (e.kind === "mood") b.mood.push(e);
    });
    wishes.forEach(w => get(wishDate(w)).wishes.push(w));
    return m;
  }, [memories, entries, wishes]);

  const iso = format(date, "yyyy-MM-dd");
  const day = byDate[iso];
  const total = day ? day.diary.length + day.manifest.length + day.dream.length + day.mood.length + day.wishes.length : 0;

  const datesWithEntries = useMemo(() => Object.keys(byDate).map(d => new Date(d + "T00:00:00")), [byDate]);

  const removeWish = (id: string) => {
    const next = readWishes().filter(w => w.id !== id);
    localStorage.setItem(WISH_KEY, JSON.stringify(next));
    setWishes(next);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 grain animate-fade-up">
      <div className="flex items-center gap-2 text-cloud-pink mb-1">
        <CalendarDays className="w-4 h-4" />
        <span className="font-pixel text-[10px] uppercase tracking-[0.35em]">memory calendar</span>
      </div>
      <h3 className="font-serif italic text-3xl md:text-4xl text-paper mb-1">your tender little timeline</h3>
      <p className="font-hand text-cloud-lilac text-xl mb-5">tap a day · revisit what you kept ✦</p>

      <div className="grid gap-6 md:grid-cols-[auto_1fr] items-start">
        <div className="rounded-2xl bg-night-deep/40 border border-cloud-pink/15 p-2 self-start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
            modifiers={{ hasEntry: datesWithEntries }}
            modifiersClassNames={{ hasEntry: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-cloud-pink" }}
            className={cn("p-3 pointer-events-auto")}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-3">
            <p className="font-serif italic text-2xl text-paper">{format(date, "EEEE, MMMM d")}</p>
            <span className="font-pixel text-[10px] tracking-[0.3em] text-cloud-pink">{total} kept</span>
          </div>

          {total === 0 && (
            <div className="rounded-2xl border border-dashed border-cloud-pink/25 px-4 py-10 text-center">
              <p className="font-hand text-2xl text-paper/60">nothing kept on this day yet</p>
              <p className="font-pixel text-[10px] tracking-[0.3em] text-paper/40 mt-2">✦ a quiet page ✦</p>
            </div>
          )}

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {day?.diary.map(m => (
              <Card key={m.id} icon={<BookHeart className="w-3.5 h-3.5" />} kind="DIARY" tint="cloud-pink">
                <p className="font-serif italic text-paper text-lg">{m.title || "untitled page"}</p>
                <p className="font-hand text-lg text-paper/80 line-clamp-3">{m.body}</p>
                <div className="flex gap-1 mt-1">{m.stickers.slice(0, 6).map(s => <span key={s.id}>{s.emoji}</span>)}</div>
              </Card>
            ))}
            {day?.manifest.map(e => (
              <Card key={e.id} icon={<Sparkles className="w-3.5 h-3.5" />} kind="MANIFESTATION" tint="cloud-lilac"
                    onDelete={() => entriesStore.remove(e.id)}>
                {e.title && <p className="font-serif italic text-paper text-lg">{e.title}</p>}
                <p className="font-hand text-lg text-paper/85 whitespace-pre-wrap">{e.body}</p>
              </Card>
            ))}
            {day?.dream.map(e => (
              <Card key={e.id} icon={<Moon className="w-3.5 h-3.5" />} kind="DREAM" tint="cloud-lilac"
                    onDelete={() => entriesStore.remove(e.id)}>
                {e.title && <p className="font-serif italic text-paper text-lg">{e.title}</p>}
                <p className="font-hand text-lg text-paper/85 whitespace-pre-wrap">{e.body}</p>
              </Card>
            ))}
            {day?.mood.map(e => (
              <Card key={e.id} icon={<span className="text-base">{e.meta?.mood}</span>} kind="MOOD" tint="cloud-pink"
                    onDelete={() => entriesStore.remove(e.id)}>
                <p className="font-hand text-lg text-paper/85">{e.body || "—"}</p>
              </Card>
            ))}
            {day?.wishes.map(w => (
              <Card key={w.id} icon={<Star className={`w-3.5 h-3.5 ${w.granted ? "fill-cloud-pink" : ""}`} />} kind="WISH" tint="cloud-pink"
                    onDelete={() => removeWish(w.id)}>
                <p className={`font-hand text-lg ${w.granted ? "text-paper/50 line-through" : "text-paper/85"}`}>✦ {w.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ icon, kind, tint, children, onDelete }: {
  icon: React.ReactNode; kind: string; tint: string;
  children: React.ReactNode; onDelete?: () => void;
}) => (
  <div className="group rounded-2xl bg-night-soft/40 border border-cloud-pink/15 px-4 py-3">
    <div className="flex items-center gap-1.5 mb-1">
      <span className={`text-${tint}`}>{icon}</span>
      <span className={`font-pixel text-[9px] tracking-[0.3em] text-${tint}`}>{kind}</span>
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-auto opacity-0 group-hover:opacity-100 text-paper/40 hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
    {children}
  </div>
);
