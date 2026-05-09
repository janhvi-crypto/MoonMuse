import { useState } from "react";
import { AmbientBackground } from "@/components/dreamscape/AmbientBackground";
import { TopNav } from "@/components/dreamscape/TopNav";
import { Hero } from "@/components/dreamscape/Hero";
import { MusicPlayer } from "@/components/dreamscape/MusicPlayer";
import { MyMusicPlayer } from "@/components/dreamscape/MyMusicPlayer";
import { Photobooth } from "@/components/dreamscape/Photobooth";
import { VisionBoard } from "@/components/dreamscape/VisionBoard";
import { SoundscapeMixer } from "@/components/dreamscape/SoundscapeMixer";
import { BreathingOrb } from "@/components/dreamscape/BreathingOrb";
import { Scrapbook } from "@/components/dreamscape/Scrapbook";
import { MemoryShelf } from "@/components/dreamscape/MemoryShelf";
import { Wishlist } from "@/components/dreamscape/Wishlist";
import { SketchPad } from "@/components/dreamscape/SketchPad";
import { ZodiacReading } from "@/components/dreamscape/ZodiacReading";
import { TarotPick } from "@/components/dreamscape/TarotPick";
import { MoodTracker } from "@/components/dreamscape/MoodTracker";
import { SaveableJournal } from "@/components/dreamscape/SaveableJournal";
import { EyeExercise } from "@/components/dreamscape/EyeExercise";
import { YogaBreak } from "@/components/dreamscape/YogaBreak";
import { MemoryCalendar } from "@/components/dreamscape/MemoryCalendar";
import type { Memory } from "@/lib/memory-store";

const SectionLabel = ({ chapter, title, sub }: { chapter: string; title: string; sub?: string }) => (
  <div className="mb-8 px-2">
    <p className="font-sans text-xs tracking-[0.4em] text-cloud-pink mb-2">✦  {chapter}</p>
    <h2 className="font-serif italic text-4xl md:text-5xl text-paper ink-stroke">{title}</h2>
    {sub && <p className="font-hand text-2xl text-cloud-lilac mt-1">{sub}</p>}
  </div>
);

const Index = () => {
  const [editing, setEditing] = useState<Memory | null>(null);

  return (
    <div className="min-h-screen relative">
      <AmbientBackground />
      <TopNav />

      {/* SCENE 1 — moonlit hero */}
      <Hero />

      <main className="relative px-4 md:px-10 pb-32 max-w-6xl mx-auto space-y-24">
        {/* SCENE 2 — the music room */}
        <section>
          <SectionLabel chapter="CHAPTER ONE" title="the music room" sub="press play — the night begins" />
          <MyMusicPlayer />
        </section>

        {/* SCENE 3 — the window — soundscape + breathing */}
        <section>
          <SectionLabel chapter="CHAPTER TWO" title="open the window" sub="layer the world. soften the lungs." />
          <div className="grid gap-6 md:grid-cols-2">
            <SoundscapeMixer />
            <BreathingOrb />
          </div>
        </section>

        {/* SCENE 4 — the scrapbook (centerpiece, full width) */}
        <section>
          <SectionLabel
            chapter="CHAPTER THREE"
            title="the scrapbook"
            sub={editing ? "editing a memory… ✎" : "tonight's blank page is waiting"}
          />
          <Scrapbook editing={editing} onSaved={() => setEditing(null)} />
        </section>

        {/* SCENE 5 — the memory shelf */}
        <section>
          <MemoryShelf onOpen={(m) => { setEditing(m); window.scrollTo({ top: document.body.scrollHeight * 0.55, behavior: "smooth" }); }} />
        </section>

        {/* SCENE 6 — daily fortune */}
        <section>
          <SectionLabel chapter="CHAPTER FOUR" title="✦ daily fortune ✦" sub="the stars left a note for you" />
          <div className="grid gap-6 md:grid-cols-2">
            <ZodiacReading />
            <TarotPick />
          </div>
        </section>

        {/* SCENE 7 — saveable entries */}
        <section>
          <SectionLabel chapter="CHAPTER FIVE" title="soft little keepsakes" sub="moods, dreams, manifestations" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MoodTracker />
            <SaveableJournal kind="dream" />
            <SaveableJournal kind="manifest" />
          </div>
        </section>

        {/* SCENE 8 — body care: eye + yoga */}
        <section>
          <SectionLabel chapter="CHAPTER SIX" title="unwind the body" sub="for tired eyes & screen-stiff shoulders" />
          <div className="grid gap-6 md:grid-cols-2">
            <EyeExercise />
            <YogaBreak />
          </div>
        </section>

        {/* SCENE 9 — wishes + sketch */}
        <section>
          <SectionLabel chapter="CHAPTER SEVEN" title="small wishes, soft hands" sub="dreams to keep, lines to draw" />
          <div className="grid gap-6 md:grid-cols-2">
            <Wishlist />
            <SketchPad />
          </div>
        </section>

        {/* SCENE 10 — calendar of everything */}
        <section>
          <SectionLabel chapter="CHAPTER EIGHT" title="✦ memory calendar ✦" sub="every wish, dream & diary in one little month" />
          <MemoryCalendar />
        </section>

        {/* SCENE 11 — vision board */}
        <section>
          <SectionLabel chapter="CHAPTER NINE" title="✦ vision board ✦" sub="the year you're dreaming into being" />
          <VisionBoard />
        </section>

        {/* SCENE 12 — photobooth */}
        <section>
          <SectionLabel chapter="CHAPTER TEN" title="pinky photobooth" sub="3 little frames · stickers · download forever" />
          <Photobooth />
        </section>
      </main>

      <footer className="relative pb-16 text-center px-6">
        <div className="h-px w-24 bg-cloud-pink/40 mx-auto mb-6" />
        <p className="font-hand text-cloud-pink text-2xl">the moon will hold the sky for you ✦</p>
        <p className="font-sans text-xs tracking-[0.3em] text-paper/40 mt-3">MOONLIT · A QUIET PLACE</p>
      </footer>
    </div>
  );
};

export default Index;
