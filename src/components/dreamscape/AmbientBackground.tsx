import bg from "@/assets/moon-clouds-bg.jpg";

export const AmbientBackground = () => {
  const stars = Array.from({ length: 80 });
  const petals = Array.from({ length: 14 });
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <img
        src={bg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "saturate(1.05)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night-deep/10 via-transparent to-night-deep/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-night-deep/30 via-transparent to-transparent" />
      {stars.map((_, i) => (
        <span
          key={`s-${i}`}
          className="absolute rounded-full bg-star animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 80}%`,
            width: `${1 + Math.random() * 2.5}px`,
            height: `${1 + Math.random() * 2.5}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 4}s`,
            boxShadow: "0 0 4px hsl(var(--star) / 0.8)",
          }}
        />
      ))}
      {petals.map((_, i) => (
        <span
          key={`p-${i}`}
          className="absolute rounded-full animate-float-up"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 5}px`,
            height: `${4 + Math.random() * 5}px`,
            background: `hsl(var(--cloud-pink) / ${0.5 + Math.random() * 0.4})`,
            animationDelay: `${Math.random() * 14}s`,
            animationDuration: `${12 + Math.random() * 10}s`,
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
};
