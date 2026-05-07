import { useEffect, useMemo, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { ZODIACS, dailyFortune, todayPretty } from "@/lib/fortune";

const todayISO = () => new Date().toISOString().slice(0, 10);

export const ZodiacReading = () => {
  const [sign, setSign] = useState<string>(() => localStorage.getItem("moonlit_zodiac") || "pisces");
  const [date, setDate] = useState(todayISO());

  useEffect(() => { localStorage.setItem("moonlit_zodiac", sign); }, [sign]);

  const z = useMemo(() => ZODIACS.find(z => z.id === sign)!, [sign]);
  const f = useMemo(() => dailyFortune(sign, date), [sign, date]);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 grain animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-cloud-pink mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="font-pixel text-[10px] uppercase tracking-[0.35em]">today's reading</span>
          </div>
          <h3 className="font-serif italic text-3xl md:text-4xl text-paper">☾ {z.name} {z.symbol}</h3>
          <p className="font-hand text-cloud-lilac text-xl mt-0.5">{todayPretty(date)}</p>
        </div>
        <button
          onClick={() => setDate(todayISO() + "·" + Math.random().toString(36).slice(2, 5))}
          className="text-paper/60 hover:text-cloud-pink transition-colors"
          title="reshuffle"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* zodiac picker */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {ZODIACS.map(zz => (
          <button
            key={zz.id}
            onClick={() => setSign(zz.id)}
            title={`${zz.name} · ${zz.dates}`}
            className={`px-2.5 py-1 rounded-full text-sm font-pixel transition-all ${
              zz.id === sign
                ? "bg-cloud-pink text-ink scale-105 sticker-shadow"
                : "bg-night-soft/60 text-paper/70 hover:bg-night-soft hover:text-paper"
            }`}
          >
            <span className="mr-1">{zz.symbol}</span>{zz.name.slice(0, 3).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="space-y-3 text-paper/90 font-serif">
        <Row label="✧ Love Life" body={f.love} />
        <Row label="✧ Money & Luck" body={f.money} />
        <Row label="✧ Study / Career" body={f.study} />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Tag title="✧ Energy Color" value={f.color} />
          <Tag title="✧ Lucky Symbols" value={f.symbols} />
        </div>
        <div className="pt-3 mt-3 border-t border-cloud-pink/20">
          <p className="font-pixel text-[10px] tracking-[0.3em] text-cloud-pink mb-1">☾ YOUR FORTUNE ☾</p>
          <p className="font-hand text-xl text-paper/95 leading-snug">♡ {f.future}</p>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, body }: { label: string; body: string }) => (
  <div>
    <p className="font-pixel text-[10px] tracking-[0.3em] text-cloud-pink mb-0.5">{label}</p>
    <p className="text-paper/90 leading-relaxed text-[15px]">{body}</p>
  </div>
);
const Tag = ({ title, value }: { title: string; value: string }) => (
  <div className="rounded-2xl bg-night-soft/40 border border-cloud-pink/15 px-3 py-2">
    <p className="font-pixel text-[9px] tracking-[0.3em] text-cloud-pink mb-0.5">{title}</p>
    <p className="font-hand text-lg text-paper">{value}</p>
  </div>
);
