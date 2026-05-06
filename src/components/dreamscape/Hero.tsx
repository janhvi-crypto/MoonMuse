export const Hero = () => {
  return (
    <header className="relative px-6 md:px-12 pt-12 md:pt-20 pb-32 md:pb-48 max-w-6xl">
      <p className="font-sans text-cloud-pink text-xs tracking-[0.4em] mb-5 animate-fade-up">
        ✦  STAY A WHILE
      </p>
      <h1
        className="font-serif italic font-light text-paper leading-[0.95] tracking-tight mb-6 ink-stroke animate-fade-up"
        style={{ fontSize: "clamp(3.5rem, 9vw, 7.5rem)", animationDelay: "0.1s" }}
      >
        breathe<br />
        under the moon
      </h1>
      <p
        className="font-serif text-paper/80 text-lg md:text-xl max-w-md leading-relaxed animate-fade-up"
        style={{ animationDelay: "0.25s" }}
      >
        the city is asleep. the clouds are pink tonight.
        <br />
        press play — let the songs hold you for a little while.
      </p>
      <div
        className="mt-8 flex items-center gap-4 animate-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="h-px w-16 bg-cloud-pink/60" />
        <span className="font-hand text-2xl text-cloud-pink">make a memory tonight ✦</span>
      </div>
    </header>
  );
};
