import { AmbientBackground } from "@/components/dreamscape/AmbientBackground";
import { MusicPlayer } from "@/components/dreamscape/MusicPlayer";
import { SpotifyPlayer } from "@/components/dreamscape/SpotifyPlayer";
import { SoundscapeMixer } from "@/components/dreamscape/SoundscapeMixer";
import { BreathingOrb } from "@/components/dreamscape/BreathingOrb";
import { Journal } from "@/components/dreamscape/Journal";
import { Diary } from "@/components/dreamscape/Diary";
import { Wishlist } from "@/components/dreamscape/Wishlist";
import { SketchPad } from "@/components/dreamscape/SketchPad";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AmbientBackground />

      <header className="relative pt-20 pb-16 px-6 text-center">
        <div className="absolute left-1/2 -translate-x-1/2 top-6 w-40 h-40 rounded-full bg-gradient-to-b from-sun-glow to-sun blur-3xl opacity-50 animate-drift" aria-hidden />
        <p className="font-hand text-sun text-2xl mb-2 animate-sway inline-block">welcome back, traveler</p>
        <h1 className="font-serif text-5xl md:text-7xl text-paper italic font-light tracking-tight mb-4 ink-stroke">
          Sundown
        </h1>
        <p className="font-serif text-paper/80 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          A quiet place for the long hours after code.
          <br />
          <span className="font-hand text-petal text-2xl">stay a while.</span>
        </p>
      </header>

      <main className="relative px-4 md:px-8 pb-24 max-w-6xl mx-auto">
        <section className="grid gap-6 md:grid-cols-2 mb-6">
          <SpotifyPlayer />
          <MusicPlayer />
        </section>

        <section className="grid gap-6 md:grid-cols-2 mb-6">
          <SoundscapeMixer />
          <BreathingOrb />
        </section>

        <section className="grid gap-6 md:grid-cols-2 mb-6">
          <Diary />
          <Journal />
        </section>

        <section className="grid gap-6 md:grid-cols-2 mb-6">
          <Wishlist />
          <SketchPad />
        </section>
      </main>

      <footer className="relative pb-12 text-center">
        <p className="font-hand text-petal text-xl">the sun will rise again ✦</p>
      </footer>
    </div>
  );
};

export default Index;
