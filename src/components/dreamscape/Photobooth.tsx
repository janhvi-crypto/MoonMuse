import { useEffect, useRef, useState } from "react";
import { Camera, Download, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STICKER_SET = [
  "🌸","✨","💗","💜","🎀","🌙","⭐","🍓","🍒","🌈","☁️","🦋","💌","🪐","🍵",
  "🥺","🥰","😴","🌷","🍡","🧸","🍰","💖","🫧","🌟","🐚","🐠","🦑","🌊","🪸",
];
const FRAMES = [
  { id: "pink",     label: "pink",      color: "#ffd6e7", deco: "#ff8cb6" },
  { id: "lilac",    label: "lilac",     color: "#d9c6ff", deco: "#a98cff" },
  { id: "cream",    label: "cream",     color: "#fff7ef", deco: "#e2b58a" },
  { id: "babyblue", label: "baby blue", color: "#cfe8ff", deco: "#7fb6e8" },
  { id: "mint",     label: "mint",      color: "#c8f0d9", deco: "#4fb38a" },
  { id: "butter",   label: "butter",    color: "#fff0b5", deco: "#e0b550" },
  { id: "plum",     label: "plum",      color: "#8b6fae", deco: "#ffd6e7" },
];
const STRIP_OPTIONS = [2, 3, 5];

interface Placed { id: string; emoji: string; x: number; y: number; rot: number; size: number; }

const PHOTO_W = 320;
const PHOTO_H = 240; // rectangle, like the reference image

export const Photobooth = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [stripCount, setStripCount] = useState<2 | 3 | 5>(3);
  const [shots, setShots] = useState<string[]>([]);
  const [stickers, setStickers] = useState<Placed[]>([]);
  const [frame, setFrame] = useState(FRAMES[0]);
  const [count, setCount] = useState<number | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }, audio: false,
      });
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setStreaming(true);
    } catch { toast.error("camera permission needed ✦"); }
  };
  useEffect(() => () => {
    const v = videoRef.current?.srcObject as MediaStream | undefined;
    v?.getTracks().forEach((t) => t.stop());
  }, []);

  const snap = () => {
    const v = videoRef.current; if (!v) return null;
    const c = document.createElement("canvas");
    c.width = PHOTO_W; c.height = PHOTO_H;
    const ctx = c.getContext("2d")!;
    ctx.translate(PHOTO_W, 0); ctx.scale(-1, 1);
    // crop to 4:3 rectangle (centered)
    const targetAspect = PHOTO_W / PHOTO_H;
    const vAspect = v.videoWidth / v.videoHeight;
    let sw = v.videoWidth, sh = v.videoHeight, sx = 0, sy = 0;
    if (vAspect > targetAspect) {
      sw = v.videoHeight * targetAspect; sx = (v.videoWidth - sw) / 2;
    } else {
      sh = v.videoWidth / targetAspect; sy = (v.videoHeight - sh) / 2;
    }
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, PHOTO_W, PHOTO_H);
    return c.toDataURL("image/jpeg", 0.92);
  };

  const takeStrip = async () => {
    setShots([]);
    const collected: string[] = [];
    for (let i = 0; i < stripCount; i++) {
      for (let n = 3; n > 0; n--) { setCount(n); await new Promise(r => setTimeout(r, 700)); }
      setCount(null);
      const url = snap();
      if (url) { collected.push(url); setShots([...collected]); }
      await new Promise(r => setTimeout(r, 400));
    }
  };

  const addSticker = (e: string) => {
    setStickers((s) => [...s, {
      id: crypto.randomUUID(), emoji: e,
      x: 0.1 + Math.random() * 0.7, y: 0.05 + Math.random() * 0.85,
      rot: -20 + Math.random() * 40, size: 36,
    }]);
  };

  const onDown = (e: React.PointerEvent, s: Placed) => {
    e.stopPropagation();
    const r = stripRef.current!.getBoundingClientRect();
    dragging.current = { id: s.id, ox: e.clientX - (r.left + s.x * r.width), oy: e.clientY - (r.top + s.y * r.height) };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const r = stripRef.current!.getBoundingClientRect();
    const x = (e.clientX - r.left - dragging.current.ox) / r.width;
    const y = (e.clientY - r.top - dragging.current.oy) / r.height;
    setStickers((all) => all.map((s) => s.id === dragging.current!.id
      ? { ...s, x: Math.max(0, Math.min(0.9, x)), y: Math.max(0, Math.min(0.95, y)) } : s));
  };
  const onUp = () => { dragging.current = null; };

  const download = async () => {
    if (shots.length < stripCount) { toast.error("take a strip first ✦"); return; }
    const padX = 28, padTop = 60, padBottom = 80, gap = 14;
    const w = PHOTO_W + padX * 2;
    const h = padTop + PHOTO_H * stripCount + gap * (stripCount - 1) + padBottom;
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    // soft outer rounded panel
    ctx.fillStyle = frame.color;
    ctx.fillRect(0, 0, w, h);
    // decorative double border
    ctx.strokeStyle = frame.deco; ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    // header text
    ctx.fillStyle = frame.deco;
    ctx.font = "bold 22px 'Fraunces', serif";
    ctx.textAlign = "center";
    ctx.fillText("✦ moonlit booth ✦", w / 2, 40);
    // photos
    for (let i = 0; i < stripCount; i++) {
      const img = new Image(); img.src = shots[i];
      await new Promise((r) => { img.onload = r; });
      const x = padX, y = padTop + i * (PHOTO_H + gap);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x - 4, y - 4, PHOTO_W + 8, PHOTO_H + 8);
      ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H);
    }
    // footer
    ctx.fillStyle = frame.id === "plum" ? "#fff" : "#8b6fae";
    ctx.font = "italic 18px 'Fraunces', serif";
    ctx.fillText("a quiet little memory ✦", w / 2, h - 42);
    ctx.font = "16px 'Caveat', cursive";
    ctx.fillText(new Date().toLocaleDateString(), w / 2, h - 22);
    // stickers
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    stickers.forEach((s) => {
      ctx.save();
      ctx.translate(s.x * w + s.size / 2, s.y * h + s.size / 2);
      ctx.rotate((s.rot * Math.PI) / 180);
      ctx.font = `${s.size}px serif`;
      ctx.fillText(s.emoji, 0, 0);
      ctx.restore();
    });
    const link = document.createElement("a");
    link.download = `moonlit-photobooth-${Date.now()}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
    toast.success("saved to your device 💗");
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 grain animate-fade-up">
      <div className="flex items-center gap-2 mb-1 text-cloud-pink">
        <Camera className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.35em]">photobooth</span>
      </div>
      <h3 className="font-serif italic text-3xl md:text-4xl text-paper mb-5">say cheese, moonchild ✦</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* camera */}
        <div>
          <div
            className="relative rounded-2xl overflow-hidden bg-night-deep mx-auto"
            style={{ aspectRatio: "4/3", maxWidth: 480 }}
          >
            <video ref={videoRef} muted playsInline className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
            {!streaming && (
              <button onClick={start}
                className="absolute inset-0 grid place-items-center bg-night-deep/80 text-cloud-pink font-hand text-2xl">
                <span><Camera className="w-8 h-8 inline mr-2" /> start camera</span>
              </button>
            )}
            {count !== null && (
              <div className="absolute inset-0 grid place-items-center bg-night-deep/40">
                <span className="font-serif text-7xl text-cloud-pink animate-pulse">{count}</span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <p className="font-hand text-xl text-cloud-pink mb-1">how many photos?</p>
            <div className="flex gap-2">
              {STRIP_OPTIONS.map((n) => (
                <button key={n} onClick={() => { setStripCount(n as 2 | 3 | 5); setShots([]); }}
                  className={`px-4 py-1.5 rounded-full font-hand text-lg ${stripCount === n ? "bg-cloud-pink text-ink" : "bg-night-mid/60 text-paper/70 hover:text-cloud-pink"}`}>
                  {n} strip
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Button onClick={takeStrip} disabled={!streaming} className="flex-1 bg-cloud-pink text-ink hover:bg-bow">
              <Sparkles className="w-4 h-4 mr-2" /> take {stripCount}-photo strip
            </Button>
            {shots.length > 0 && (
              <Button variant="ghost" onClick={() => { setShots([]); setStickers([]); }} className="text-paper/70">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="mt-4">
            <p className="font-hand text-xl text-cloud-pink mb-1">frame color</p>
            <div className="flex gap-2 flex-wrap">
              {FRAMES.map((f) => (
                <button key={f.id} onClick={() => setFrame(f)}
                  title={f.label}
                  className={`w-9 h-9 rounded-full border-2 ${frame.id === f.id ? "border-cloud-pink scale-110" : "border-white/30"}`}
                  style={{ background: f.color }} />
              ))}
            </div>
          </div>
        </div>

        {/* strip preview — cute rectangle frame */}
        <div>
          <div
            ref={stripRef}
            onPointerMove={onMove} onPointerUp={onUp}
            className="relative mx-auto touch-none"
            style={{
              width: 240,
              background: frame.color,
              padding: "32px 18px 56px",
              boxShadow: "0 12px 30px rgba(40,30,60,0.25)",
              borderRadius: 18,
              outline: `3px solid ${frame.deco}`,
              outlineOffset: -8,
            }}
          >
            <p className="absolute top-3 left-0 right-0 text-center font-serif italic text-sm" style={{ color: frame.deco }}>
              ✦ moonlit booth ✦
            </p>
            {Array.from({ length: stripCount }).map((_, i) => (
              <div key={i}
                className="bg-white/90 rounded-sm overflow-hidden mb-2"
                style={{
                  aspectRatio: `${PHOTO_W}/${PHOTO_H}`,
                  padding: 3,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                }}
              >
                {shots[i] ? (
                  <img src={shots[i]} alt="" className="w-full h-full object-cover rounded-sm" />
                ) : (
                  <div className="w-full h-full bg-paper/10 rounded-sm" />
                )}
              </div>
            ))}
            <p className="font-hand text-center text-ink text-sm mt-2">
              {new Date().toLocaleDateString()} ✦
            </p>
            {stickers.map((s) => (
              <button key={s.id}
                onPointerDown={(e) => onDown(e, s)}
                onDoubleClick={() => setStickers((all) => all.filter((x) => x.id !== s.id))}
                className="absolute select-none cursor-grab active:cursor-grabbing"
                style={{
                  left: `${s.x * 100}%`, top: `${s.y * 100}%`,
                  fontSize: s.size, transform: `rotate(${s.rot}deg)`, touchAction: "none",
                }}>
                {s.emoji}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <p className="font-hand text-xl text-cloud-pink mb-1">stickers</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {STICKER_SET.map((s) => (
                <button key={s} onClick={() => addSticker(s)} className="text-2xl hover:scale-125 transition">{s}</button>
              ))}
            </div>
            <p className="text-[11px] text-paper/40 font-sans mt-1">drag · double-click to remove</p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={download} className="flex-1 bg-cloud-lilac text-ink hover:bg-cloud-pink">
              <Download className="w-4 h-4 mr-2" /> download strip
            </Button>
            {stickers.length > 0 && (
              <Button variant="ghost" onClick={() => setStickers([])} className="text-paper/60">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
