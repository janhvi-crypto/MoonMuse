import { useEffect, useRef, useState } from "react";
import { Brush, Eraser, Trash2, Download } from "lucide-react";

const palette = ["hsl(8 80% 58%)", "hsl(48 90% 78%)", "hsl(340 65% 78%)", "hsl(220 30% 88%)", "hsl(252 35% 25%)", "hsl(160 50% 60%)"];

export const SketchPad = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState(palette[0]);
  const [size, setSize] = useState(6);
  const [erasing, setErasing] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    last.current = pos(e);
    canvasRef.current!.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = erasing ? size * 3 : size;
    ctx.globalAlpha = erasing ? 1 : 0.85;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const end = () => { drawing.current = false; last.current = null; };

  const clear = () => {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  };
  const save = () => {
    const url = canvasRef.current!.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = `sundown-sketch-${Date.now()}.png`; a.click();
  };

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 mb-1 text-petal">
        <Brush className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">sketch</span>
      </div>
      <h3 className="font-serif text-2xl text-paper mb-4">a quiet canvas</h3>

      <div className="paper-card grain p-2 mb-4">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full h-72 rounded-lg cursor-crosshair touch-none block"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {palette.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setErasing(false); }}
              className={`w-6 h-6 rounded-full transition-transform ${color === c && !erasing ? "scale-125 ring-2 ring-paper ring-offset-2 ring-offset-card" : ""}`}
              style={{ background: c }}
              aria-label="color"
            />
          ))}
        </div>
        <input
          type="range" min={1} max={20} value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="flex-1 min-w-[80px] max-w-[120px] accent-[hsl(var(--sun))]"
        />
        <button onClick={() => setErasing(!erasing)} className={`p-2 rounded-lg transition-colors ${erasing ? "bg-sun text-ink" : "text-paper hover:text-sun"}`}>
          <Eraser className="w-4 h-4" />
        </button>
        <button onClick={save} className="p-2 text-paper hover:text-sun transition-colors">
          <Download className="w-4 h-4" />
        </button>
        <button onClick={clear} className="p-2 text-paper hover:text-destructive transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
