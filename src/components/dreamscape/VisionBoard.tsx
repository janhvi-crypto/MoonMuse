import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ImagePlus, Eye, Type, Download, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { cloudSync } from "@/lib/cloud-sync";
import { entriesStore } from "@/lib/entries-store";

const STICKERS = ["🌸","✨","💗","💜","🎀","🌙","⭐","🦋","🌈","💌","🪐","🧸","🌷","☁️","💖","🍓"];
const KEY = "moonlit_vision_boards";
const FRAME_COLORS = ["#ffd6e7","#d9c6ff","#cfe8ff","#fff7ef","#ffe9b5","#c8f0d9"];
const TEXT_COLORS = ["#8b6fae","#d6336c","#5563de","#0f766e","#1e1e1e","#b45309"];

interface Item {
  id: string;
  type: "photo" | "sticker" | "text";
  src?: string;
  emoji?: string;
  text?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  x: number; y: number; rot: number; size: number;
}
interface Board { year: number; title: string; items: Item[]; }

const blankBoard = (year: number): Board => ({ year, title: `Vision Board ${year}`, items: [] });

export const VisionBoard = () => {
  const [boards, setBoards] = useState<Board[]>(() => {
    const b = cloudSync.get<Board[]>(KEY, []);
    return b.length ? b : [blankBoard(new Date().getFullYear())];
  });
  const [activeYear, setActiveYear] = useState(boards[0].year);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; ox: number; oy: number } | null>(null);

  useEffect(() => cloudSync.subscribe(KEY, () => {
    const b = cloudSync.get<Board[]>(KEY, []);
    setBoards(b.length ? b : [blankBoard(new Date().getFullYear())]);
  }), []);

  const persist = (next: Board[]) => { setBoards(next); cloudSync.set(KEY, next); };
  const active = boards.find((b) => b.year === activeYear) ?? boards[0];
  const selected = active.items.find((i) => i.id === selectedId) ?? null;

  const updateActive = (mut: (b: Board) => Board) => {
    persist(boards.map((b) => b.year === active.year ? mut(b) : b));
  };

  const addBoard = () => {
    const y = Math.max(...boards.map((b) => b.year)) + 1;
    persist([...boards, blankBoard(y)]); setActiveYear(y);
  };
  const deleteBoard = () => {
    if (boards.length <= 1) { toast.error("keep at least one ✦"); return; }
    const next = boards.filter((b) => b.year !== active.year);
    persist(next); setActiveYear(next[0].year);
  };

  const addItem = (it: Omit<Item, "id" | "x" | "y" | "rot">) => {
    const item: Item = {
      id: crypto.randomUUID(),
      x: 0.1 + Math.random() * 0.6,
      y: 0.1 + Math.random() * 0.6,
      rot: -8 + Math.random() * 16,
      ...it,
    };
    updateActive((b) => ({ ...b, items: [...b.items, item] }));
    setSelectedId(item.id);
  };

  const addSticker = (emoji: string) => addItem({ type: "sticker", emoji, size: 48 });
  const addText = (text = "type here ✦", color = TEXT_COLORS[0]) =>
    addItem({ type: "text", text, color, bold: false, italic: true, size: 28 });

  const addWishlist = () => {
    const wishes = cloudSync.get<{ text: string }[]>("moonlit_wishlist", []);
    if (!wishes.length) { toast.error("write a wish first ✦"); return; }
    addText("✦ wishlist ✦\n" + wishes.slice(0, 8).map((w) => `· ${w.text}`).join("\n"), "#d6336c");
  };
  const addManifest = () => {
    const list = entriesStore.list("manifest");
    if (!list.length) { toast.error("write a manifestation first ✦"); return; }
    const top = list.slice(0, 5).map((e) => `· ${e.title || e.body}`).join("\n");
    addText("✦ i am manifesting ✦\n" + top, "#5563de");
  };

  const uploadPhoto = (file: File) => {
    const fr = new FileReader();
    fr.onload = () => addItem({ type: "photo", src: fr.result as string, size: 200 });
    fr.readAsDataURL(file);
  };

  const updateItem = (id: string, patch: Partial<Item>) =>
    updateActive((b) => ({ ...b, items: b.items.map((i) => i.id === id ? { ...i, ...patch } : i) }));

  const onDown = (e: React.PointerEvent, it: Item) => {
    e.stopPropagation();
    setSelectedId(it.id);
    const r = boardRef.current!.getBoundingClientRect();
    drag.current = { id: it.id, ox: e.clientX - (r.left + it.x * r.width), oy: e.clientY - (r.top + it.y * r.height) };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const r = boardRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left - drag.current.ox) / r.width;
    const y = (e.clientY - r.top - drag.current.oy) / r.height;
    updateItem(drag.current.id, { x: Math.max(0, Math.min(0.95, x)), y: Math.max(0, Math.min(0.95, y)) });
  };
  const onUp = () => { drag.current = null; };
  const remove = (id: string) => {
    updateActive((b) => ({ ...b, items: b.items.filter((i) => i.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const download = async () => {
    if (!boardRef.current) return;
    toast.loading("painting your board ✦", { id: "vb" });
    const canvas = await html2canvas(boardRef.current, { backgroundColor: null, scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = `${active.title.replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("saved 💗", { id: "vb" });
  };

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
        onClick={() => setSelectedId(null)}
        className="relative rounded-2xl overflow-hidden touch-none"
        style={{
          aspectRatio: "16/10",
          background: "linear-gradient(160deg, #ffd6e7 0%, #d9c6ff 60%, #cfe8ff 100%)",
          boxShadow: "var(--shadow-paper)",
        }}
      >
        {active.items.length === 0 && (
          <p className="absolute inset-0 grid place-items-center font-hand text-2xl text-ink/40 pointer-events-none text-center px-4">
            add photos · text · wishlist · manifestations · stickers ✦
          </p>
        )}
        {active.items.map((it) => (
          <div key={it.id}
            onPointerDown={(e) => onDown(e, it)}
            onDoubleClick={() => remove(it.id)}
            className={`absolute select-none cursor-grab active:cursor-grabbing sticker-shadow ${selectedId === it.id ? "ring-2 ring-cloud-pink ring-offset-2 ring-offset-transparent rounded" : ""}`}
            style={{
              left: `${it.x * 100}%`, top: `${it.y * 100}%`,
              transform: `rotate(${it.rot}deg)`, touchAction: "none",
            }}
          >
            {it.type === "photo" && (
              <img src={it.src} alt="" draggable={false}
                style={{ width: it.size, height: it.size, objectFit: "cover", padding: 6, background: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }} />
            )}
            {it.type === "sticker" && <span style={{ fontSize: it.size }}>{it.emoji}</span>}
            {it.type === "text" && (
              <div
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontSize: it.size,
                  color: it.color,
                  fontWeight: it.bold ? 700 : 400,
                  fontStyle: it.italic ? "italic" : "normal",
                  whiteSpace: "pre-wrap",
                  maxWidth: 360,
                  lineHeight: 1.2,
                  textShadow: "0 1px 2px rgba(255,255,255,0.4)",
                }}
              >
                {it.text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* selected text editor */}
      {selected && selected.type === "text" && (
        <div className="mt-3 p-3 rounded-xl bg-night-mid/40 flex flex-wrap gap-3 items-center">
          <textarea
            value={selected.text}
            onChange={(e) => updateItem(selected.id, { text: e.target.value })}
            rows={2}
            className="flex-1 min-w-[220px] bg-night-deep/60 text-paper rounded-md px-2 py-1 text-sm outline-none"
          />
          <button onClick={() => updateItem(selected.id, { bold: !selected.bold })}
            className={`px-2 py-1 rounded font-bold ${selected.bold ? "bg-cloud-pink text-ink" : "bg-night-deep/50 text-paper"}`}>B</button>
          <button onClick={() => updateItem(selected.id, { italic: !selected.italic })}
            className={`px-2 py-1 rounded italic font-serif ${selected.italic ? "bg-cloud-pink text-ink" : "bg-night-deep/50 text-paper"}`}>I</button>
          <input type="range" min={14} max={64} value={selected.size}
            onChange={(e) => updateItem(selected.id, { size: +e.target.value })} className="w-24" />
          <div className="flex gap-1">
            {TEXT_COLORS.map((c) => (
              <button key={c} onClick={() => updateItem(selected.id, { color: c })}
                className={`w-5 h-5 rounded-full border ${selected.color === c ? "border-cloud-pink scale-125" : "border-white/40"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="font-hand text-xl text-cloud-pink mr-1">stickers</span>
        {STICKERS.map((s) => (
          <button key={s} onClick={() => addSticker(s)} className="text-2xl hover:scale-125 transition">{s}</button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => addText()} className="bg-cloud-lilac text-ink hover:bg-cloud-pink">
          <Type className="w-4 h-4 mr-1" /> add text
        </Button>
        <Button size="sm" onClick={addWishlist} variant="outline" className="border-cloud-pink/40">
          <Star className="w-4 h-4 mr-1" /> + wishlist
        </Button>
        <Button size="sm" onClick={addManifest} variant="outline" className="border-cloud-pink/40">
          <Heart className="w-4 h-4 mr-1" /> + manifestations
        </Button>
        <label className="cursor-pointer flex items-center gap-1.5 bg-cloud-pink text-ink rounded-full px-3 py-1.5 text-sm font-medium hover:bg-bow">
          <ImagePlus className="w-4 h-4" /> photo
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
        </label>
        <Button size="sm" onClick={download} className="bg-bow text-ink hover:bg-cloud-pink ml-auto">
          <Download className="w-4 h-4 mr-1" /> download board
        </Button>
        <Button size="sm" variant="ghost" onClick={deleteBoard} className="text-paper/60 hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-1" /> delete year
        </Button>
      </div>
      <p className="text-[11px] text-paper/40 font-sans mt-2 text-center">
        tap to select · drag to move · double-click to remove · saved privately on this device
      </p>
    </div>
  );
};
