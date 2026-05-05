import heroImg from "@/assets/hero-dreamscape.jpg";

export const AmbientBackground = () => {
  const stars = Array.from({ length: 60 });
  const fireflies = Array.from({ length: 18 });
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden grain">
      <img
        src={heroImg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-soft-light"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-dusk-deep/40 via-transparent to-dusk-deep" />
      {stars.map((_, i) => (
        <span
          key={`s-${i}`}
          className="absolute rounded-full bg-star animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 4}s`,
          }}
        />
      ))}
      {fireflies.map((_, i) => (
        <span
          key={`f-${i}`}
          className="absolute rounded-full bg-sun-glow blur-[2px] animate-float-up"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${3 + Math.random() * 4}px`,
            height: `${3 + Math.random() * 4}px`,
            animationDelay: `${Math.random() * 12}s`,
            animationDuration: `${10 + Math.random() * 10}s`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};
