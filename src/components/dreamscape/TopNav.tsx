import { useEffect, useState } from "react";
import { Sparkles, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export const TopNav = () => {
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const h = d.getHours() % 12 || 12;
      const m = d.getMinutes().toString().padStart(2, "0");
      const ap = d.getHours() >= 12 ? "PM" : "AM";
      setTime(`${h}:${m} ${ap}`);
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  const savePage = async () => {
    setBusy(true);
    toast.loading("capturing the moonlight ✦", { id: "page" });
    try {
      const target = document.body;
      const canvas = await html2canvas(target, {
        backgroundColor: "#1a1428",
        scale: window.devicePixelRatio > 1 ? 1.5 : 2,
        useCORS: true,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
        height: target.scrollHeight,
        width: target.scrollWidth,
      });
      const link = document.createElement("a");
      link.download = `moonlit-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("saved to your device 💗", { id: "page" });
    } catch {
      toast.error("couldn't save the page", { id: "page" });
    } finally { setBusy(false); }
  };

  return (
    <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 py-6 font-sans text-paper/90">
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 text-cloud-pink" />
        <span className="text-sm md:text-base tracking-[0.4em] font-medium">MOONLIT</span>
      </div>
      <div className="flex items-center gap-4 md:gap-6 text-xs tracking-[0.35em] text-paper/70">
        <span className="hidden md:flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-cloud-pink animate-twinkle" />
          {time}
        </span>
        <span className="hidden md:inline">·</span>
        <span className="hidden md:inline">A QUIET PLACE</span>
        <button
          onClick={savePage} disabled={busy}
          className="flex items-center gap-1.5 rounded-full bg-cloud-pink/90 hover:bg-cloud-pink text-ink px-3 py-1.5 tracking-normal text-[11px] font-medium disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" /> {busy ? "saving…" : "save page"}
        </button>
      </div>
    </nav>
  );
};
