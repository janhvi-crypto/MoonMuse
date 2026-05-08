import { useEffect, useRef, useState } from "react";
import { Sparkles, Plus, Trash2, ImagePlus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { cloudSync } from "@/lib/cloud-sync";

const STICKERS = ["🌸","✨","💗","💜","🎀","🌙","⭐","🦋","🌈","💌","🪐","🧸","🌷","☁️","💖","🍓"];
const KEY = "moonlit_vision_boards";

interface Item { id: string; type: "photo" | "sticker"; src?: string; emoji?: string; x: number; y: number; rot: number; size: number; }
interface Board { year: number; title: string; items: Item[]; }

const blankBoard = (year: number): Board => ({ year, title: `Vision Board ${year}`, items: [] });

export const VisionBoard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>(() => {
    const b = cloudSync.get<Board[]>(KEY, []);
    return b.length ? b : [blankBoard(new Date().getFullYear())];
  });
  const [activeYear, setActiveYear] = useState(boards[0].year);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; ox: number; oy: number } | null>(null);

  useEffect(() => cloudSync.subscribe(KEY, () => {
    const b = cloudSync.get<Board[]>(KEY, []);
    setBoards(b.length ? b : [blankBoard(new Date().getFullYear())]);
  }), []);

  const persist = (next: Board[]) => { setBoards(next); cloudSync.set(KEY, next); };
  const active = boards.find((b) => b.year === activeYear) ?? boards[0];

  const updateActive = (mut: (b: Board) => Board) => {
    persist(boards.map((b) => b.year === active.year ? mut(b) : b));
  };

  const addBoard = () => {
    const y = Math.max(...boards.map((b) => b.year)) + 1;
    persist([...boards, blankBoard(y)]);
    setActiveYear(y);
  };
  const deleteBoard = () => {
    if (boards.length <= 1) { toast.error("keep at least one ✦"); return; }
    const next = boards.filter((b) => b.year !== active.year);
    persist(next); setActiveYear(next[0].year);
  };

  const addSticker = (emoji: string) => updateActive((b) => ({
    ...b, items: [...b.items, {
      id: crypto.randomUUID(), type: "sticker", emoji,
      x: 0.1 + Math.random() * 0.7, y: 0.1 + Math.random() * 0.7,
      rot: -15 + Math.random() * 30, size: 48,
    }]
  }));

  const uploadPhoto = async (file: File) => {
    let src = "";
    if (user) {
      const path = `${user.id}/${active.year}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("vision-board").upload(path, file, { upsert: false });
      if (error) { toast.error(error.message); return; }
      const { data } = await supabase.storage.from("vision-board").createSignedUrl(path, 60 * 60 * 24 * 365);
      src = data?.signedUrl || "";
    } else {
      src = await new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(file); });
    }
    if (!src) return;
    updateActive((b) => ({
      ...b, items: [...b.items, {
        id: crypto.randomUUID(), type: "photo", src,
        x: 0.05 + Math.random() * 0.6, y: 0.05 + Math.random() * 0.6,
        rot: -8 + Math.random() * 16, size: 180,
      }]
    }));
  };

  const onDown = (e: React.PointerEvent, it: Item) => {
    e.stopPropagation();
    const r = boardRef.current!.getBoundingClientRect();
    drag.current = { id: it.id, ox: e.clientX - (r.left + it.x * r.width), oy: e.clientY - (r.top + it.y * r.height) };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const r = boardRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left - drag.current.ox) / r.width;
    const y = (e.clientY - r.top - drag.current.oy) / r.height;
    updateActive((b) => ({
      ...b, items: b.items.map((i) => i.id === drag.current!.id
        ? { ...i, x: Math.max(0, Math.min(0.95, x)), y: Math.max(0, Math.min(0.95, y)) } : i)
    }));
  };
  const onUp = () => { drag.current = null; };
  const remove = (id: string) => updateActive((b) => ({ ...b, items: b.items.filter((i) => i.id !== id) }));

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 grain animate-fade-up">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-cloud-pink mb-1">
            <Eye className="w-4 h-4" />
            <span className="font-sans text-xs uppercase tracking-[0.35em]">vision board</span>
          </div>
          <Input value={active.title}
            onChange={(e) => updateActive((b) => ({ ...b, title: e.target.value }))}
            className="bg-transparent border-0 font-serif italic text-3xl md:text-4xl text-paper p-0 h-auto focus-visible:ring-0" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {boards.map((b) => (
            <button key={b.year} onClick={() => setActiveYear(b.year)}
              className={`px-3 py-1 rounded-full font-hand text-lg ${b.year === active.year ? "bg-cloud-pink text-ink" : "bg-night-mid/60 text-paper/70 hover:text-cloud-pink"}`}>
              {b.year}
            </button>
          ))}
          <Button size="sm" variant="ghost" onClick={addBoard} className="text-cloud-pink">
            <Plus className="w-4 h-4 mr-1" /> year
          </Button>
        </div>
      </div>

      <div
        ref={boardRef}
        onPointerMove={onMove} onPointerUp={onUp}
        className="relative rounded-2xl overflow-hidden touch-none"
        style={{
          aspectRatio: "16/9",
          background: "linear-gradient(160deg, #ffd6e7 0%, #d9c6ff 60%, #cfe8ff 100%)",
          boxShadow: "var(--shadow-paper)",
        }}
      >
        {active.items.length === 0 && (
          <p className="absolute inset-0 grid place-items-center font-hand text-2xl text-ink/40 pointer-events-none">
            add photos & stickers · build your year ✦
          </p>
        )}
        {active.items.map((it) => (
          <div key={it.id}
            onPointerDown={(e) => onDown(e, it)}
            onDoubleClick={() => remove(it.id)}
            className="absolute select-none cursor-grab active:cursor-grabbing sticker-shadow"
            style={{
              left: `${it.x * 100}%`, top: `${it.y * 100}%`,
              transform: `rotate(${it.rot}deg)`, touchAction: "none",
            }}
          >
            {it.type === "photo" ? (
              <img src={it.src} alt="" draggable={false}
                style={{ width: it.size, height: it.size, objectFit: "cover", padding: 6, background: "white" }} />
            ) : (
              <span style={{ fontSize: it.size }}>{it.emoji}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-hand text-xl text-cloud-pink mr-2">stickers</span>
        {STICKERS.map((s) => (
          <button key={s} onClick={() => addSticker(s)} className="text-2xl hover:scale-125 transition">{s}</button>
        ))}
        <label className="ml-auto cursor-pointer flex items-center gap-1.5 bg-cloud-pink text-ink rounded-full px-3 py-1.5 text-sm font-medium hover:bg-bow">
          <ImagePlus className="w-4 h-4" /> add photo
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
        </label>
        <Button variant="ghost" onClick={deleteBoard} className="text-paper/60 hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-1" /> delete year
        </Button>
      </div>
      <p className="text-[11px] text-paper/40 font-sans mt-2 text-center">
        drag to move · double-click to remove · {user ? "photos saved privately to your account" : "sign in to save photos in the cloud"}
      </p>
    </div>
  );
};
