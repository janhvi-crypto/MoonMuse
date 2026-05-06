import { useEffect, useMemo, useRef, useState } from "react";
import { BookHeart, Save, Trash2, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STICKERS, MOODS, WASHI_TAPES } from "@/lib/stickers";
import { memoryStore, type Memory, type PlacedSticker } from "@/lib/memory-store";
import { toast } from "sonner";

const PAPERS = {
  pink: "var(--gradient-paper-pink)",
  cream: "var(--gradient-paper)",
  lilac: "linear-gradient(160deg, hsl(280 60% 95%) 0%, hsl(260 50% 88%) 100%)",
} as const;

const today = () => new Date().toISOString().slice(0, 10);
const newId = () => crypto.randomUUID();
const fmt = (s: string) =>
  new Date(s + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const blank = (): Memory => ({
  id: newId(),
  date: today(),
  title: "",
  body: "",
  mood: "soft",
  stickers: [],
  paperColor: "pink",
  createdAt: Date.now(),
});

interface Props {
  editing?: Memory | null;
  onSaved?: () => void;
}

export const Scrapbook = ({ editing, onSaved }: Props) => {
  const [mem, setMem] = useState<Memory>(editing ?? blank());
  const [photo, setPhoto] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; offX: number; offY: number } | null>(null);

  useEffect(() => {
    if (editing) setMem(editing);
  }, [editing]);

  const addSticker = (emoji: string) => {
    const s: PlacedSticker = {
      id: newId(),
      emoji,
      x: 0.1 + Math.random() * 0.7,
      y: 0.1 + Math.random() * 0.7,
      rotation: -15 + Math.random() * 30,
      scale: 1,
    };
    setMem((m) => ({ ...m, stickers: [...m.stickers, s] }));
  };

  const removeSticker = (id: string) =>
    setMem((m) => ({ ...m, stickers: m.stickers.filter((s) => s.id !== id) }));

  const onPointerDown = (e: React.PointerEvent, s: PlacedSticker) => {
    e.stopPropagation();
    const rect = pageRef.current!.getBoundingClientRect();
    dragging.current = {
      id: s.id,
      offX: e.clientX - (rect.left + s.x * rect.width),
      offY: e.clientY - (rect.top + s.y * rect.height),
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const rect = pageRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left - dragging.current.offX) / rect.width;
    const y = (e.clientY - rect.top - dragging.current.offY) / rect.height;
    setMem((m) => ({
      ...m,
      stickers: m.stickers.map((s) =>
        s.id === dragging.current!.id
          ? { ...s, x: Math.max(0, Math.min(0.92, x)), y: Math.max(0, Math.min(0.92, y)) }
          : s
      ),
    }));
  };
  const onPointerUp = () => { dragging.current = null; };

  const save = () => {
    if (!mem.title.trim() && !mem.body.trim()) {
      toast.error("write something first ✦");
      return;
    }
    memoryStore.save({ ...mem, createdAt: editing?.createdAt ?? Date.now() });
    toast.success("kept as a memory 💗");
    onSaved?.();
    setMem(blank());
    setPhoto(null);
  };

  const tapeStyles = useMemo(
    () => [
      { top: -10, left: "8%", width: 110, rotate: -6, bg: WASHI_TAPES[0] },
      { top: -8, right: "12%", width: 95, rotate: 5, bg: WASHI_TAPES[1] },
    ],
    []
  );

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 grain animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-cloud-pink mb-1">
            <BookHeart className="w-4 h-4" />
            <span className="font-sans text-xs uppercase tracking-[0.35em]">scrapbook diary</span>
          </div>
          <h3 className="font-serif italic text-3xl md:text-4xl text-paper">tonight's page</h3>
        </div>
        <div className="flex gap-1.5">
          {(Object.keys(PAPERS) as (keyof typeof PAPERS)[]).map((c) => (
            <button
              key={c}
              onClick={() => setMem({ ...mem, paperColor: c })}
              className={`w-6 h-6 rounded-full transition-transform ${mem.paperColor === c ? "scale-125 ring-2 ring-paper" : ""}`}
              style={{ background: PAPERS[c] }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {/* THE PAGE */}
      <div
        ref={pageRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative grain rounded-2xl p-6 md:p-10 min-h-[480px] overflow-hidden touch-none"
        style={{ background: PAPERS[mem.paperColor], boxShadow: "var(--shadow-paper)" }}
      >
        {/* washi tape */}
        {tapeStyles.map((t, i) => (
          <div
            key={i}
            className="absolute h-6 z-10 pointer-events-none"
            style={{
              top: t.top,
              left: t.left as any,
              right: t.right as any,
              width: t.width,
              transform: `rotate(${t.rotate}deg)`,
              background: t.bg,
              boxShadow: "0 2px 6px hsl(0 0% 0% / 0.2)",
              borderRadius: 2,
            }}
          />
        ))}

        {/* date */}
        <p className="font-hand text-2xl text-ink/60 mb-2">{fmt(mem.date)}</p>

        {/* title */}
        <input
          value={mem.title}
          onChange={(e) => setMem({ ...mem, title: e.target.value })}
          placeholder="a title for tonight…"
          className="w-full bg-transparent outline-none font-serif italic text-3xl md:text-4xl text-ink placeholder:text-ink/30 mb-3"
        />

        {/* mood */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-hand text-xl text-ink/50">today i feel</span>
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMem({ ...mem, mood: m.id })}
              className={`text-2xl transition-all ${mem.mood === m.id ? "scale-125 drop-shadow-lg" : "opacity-50 hover:opacity-90"}`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        {/* photo */}
        {photo && (
          <div className="relative inline-block mb-3 sticker-shadow" style={{ transform: "rotate(-3deg)" }}>
            <img src={photo} alt="memory" className="w-40 h-40 object-cover" style={{ padding: 8, background: "white" }} />
            <button
              onClick={() => setPhoto(null)}
              className="absolute -top-2 -right-2 bg-night-deep text-paper rounded-full w-6 h-6 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* body */}
        <textarea
          value={mem.body}
          onChange={(e) => setMem({ ...mem, body: e.target.value })}
          placeholder="dear diary, tonight…"
          className="w-full min-h-[200px] bg-transparent outline-none resize-none font-hand text-2xl text-ink/90 leading-9 placeholder:text-ink/30"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 35px, hsl(var(--ink) / 0.07) 35px, hsl(var(--ink) / 0.07) 36px)",
            lineHeight: "36px",
          }}
        />

        {/* placed stickers */}
        {mem.stickers.map((s) => (
          <button
            key={s.id}
            onPointerDown={(e) => onPointerDown(e, s)}
            onDoubleClick={() => removeSticker(s.id)}
            className="absolute text-4xl select-none cursor-grab active:cursor-grabbing sticker-shadow hover:scale-110 transition-transform z-20"
            style={{
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              transform: `rotate(${s.rotation}deg) scale(${s.scale})`,
              touchAction: "none",
            }}
            title="drag · double-click to remove"
          >
            {s.emoji}
          </button>
        ))}
      </div>

      {/* Sticker tray */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="font-hand text-xl text-cloud-pink mr-2">stickers</span>
        {STICKERS.map((s) => (
          <button
            key={s.id}
            onClick={() => addSticker(s.emoji)}
            className="text-2xl hover:scale-125 active:scale-95 transition-transform p-1"
            title={s.label}
          >
            {s.emoji}
          </button>
        ))}
        <label className="ml-auto cursor-pointer text-paper/70 hover:text-cloud-pink transition-colors flex items-center gap-1.5 text-sm font-sans">
          <ImageIcon className="w-4 h-4" />
          add photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const r = new FileReader();
              r.onload = () => setPhoto(r.result as string);
              r.readAsDataURL(f);
            }}
          />
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={save} className="flex-1 bg-cloud-pink text-ink hover:bg-bow font-medium">
          <Save className="w-4 h-4 mr-2" /> keep as a memory
        </Button>
        <Button
          variant="ghost"
          onClick={() => { setMem(blank()); setPhoto(null); }}
          className="text-paper/70 hover:text-paper"
        >
          <Plus className="w-4 h-4 mr-1" /> blank page
        </Button>
      </div>
      <p className="text-xs text-paper/50 font-sans mt-2 text-center">
        drag stickers around · double-click a sticker to remove it
      </p>
    </div>
  );
};
