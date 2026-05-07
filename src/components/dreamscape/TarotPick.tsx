import { useState } from "react";
import { Sparkles, RotateCw } from "lucide-react";
import { drawTarot, TAROT, type TarotCard } from "@/lib/fortune";

const DECK_SIZE = 10;

export const TarotPick = () => {
  const [deck, setDeck] = useState<TarotCard[]>(() => drawTarot(DECK_SIZE));
  const [picked, setPicked] = useState<number[]>([]);
  const labels = ["1st Card", "2nd Card", "3rd Card"];

  const pick = (i: number) => {
    if (picked.includes(i) || picked.length >= 3) return;
    setPicked([...picked, i]);
  };
  const reset = () => { setPicked([]); setDeck(drawTarot(DECK_SIZE)); };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 grain animate-fade-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-cloud-pink mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="font-pixel text-[10px] uppercase tracking-[0.35em]">tarot reading</span>
          </div>
          <h3 className="font-serif italic text-3xl md:text-4xl text-paper">「 pick three cards 」</h3>
          <p className="font-hand text-cloud-lilac text-xl mt-0.5">
            {picked.length < 3 ? `tap ${3 - picked.length} more · trust your hand` : "✦ your reading ✦"}
          </p>
        </div>
        <button onClick={reset} className="text-paper/60 hover:text-cloud-pink transition-colors" title="new deck">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* DECK */}
      <div className="flex flex-wrap gap-2 justify-center py-4">
        {deck.map((c, i) => {
          const order = picked.indexOf(i);
          const isPicked = order >= 0;
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={isPicked || picked.length >= 3}
              className={`relative w-16 h-24 md:w-20 md:h-28 rounded-lg transition-all duration-500 ${
                isPicked ? "scale-105" : "hover:-translate-y-2 hover:rotate-1"
              }`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div
                className="absolute inset-0 rounded-lg flex items-center justify-center text-2xl"
                style={{
                  background: isPicked
                    ? "linear-gradient(160deg, hsl(340 70% 96%), hsl(280 60% 88%))"
                    : "repeating-linear-gradient(45deg, hsl(285 55% 35%) 0 6px, hsl(280 60% 28%) 6px 12px)",
                  border: "1px solid hsl(var(--cloud-pink) / 0.4)",
                  boxShadow: isPicked
                    ? "0 0 25px hsl(var(--cloud-pink) / 0.5), 0 6px 18px hsl(0 0% 0% / 0.4)"
                    : "0 4px 12px hsl(0 0% 0% / 0.4)",
                  color: isPicked ? "hsl(var(--ink))" : "hsl(var(--cloud-pink))",
                }}
              >
                {isPicked ? <span className="font-serif italic text-3xl">{c.symbol}</span> : "✦"}
              </div>
              {isPicked && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-cloud-pink text-ink text-xs font-pixel flex items-center justify-center sticker-shadow">
                  {order + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* REVEAL */}
      {picked.length > 0 && (
        <div className="mt-5 space-y-3">
          {picked.map((i, n) => {
            const c = deck[i];
            return (
              <div
                key={i}
                className="rounded-2xl px-4 py-3 border border-cloud-pink/25 bg-night-soft/40 animate-fade-up"
                style={{ animationDelay: `${n * 0.4}s` }}
              >
                <p className="font-pixel text-[10px] tracking-[0.3em] text-cloud-pink mb-0.5">{labels[n]}</p>
                <p className="font-serif italic text-2xl text-paper">{c.name} <span className="text-cloud-pink">{c.symbol}</span></p>
                <p className="font-hand text-xl text-paper/85 mt-0.5">{c.meaning}</p>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-paper/40 font-pixel mt-4 text-center tracking-[0.25em]">
        {TAROT.length} arcana · drawn fresh each time
      </p>
    </div>
  );
};
