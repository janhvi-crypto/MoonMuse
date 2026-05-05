import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { CloudRain, Waves, Flame, Wind, Trees, CloudLightning } from "lucide-react";
import { setSoundVolume, stopAllSounds, type SoundType } from "@/lib/ambient-audio";

const sounds: { id: SoundType; label: string; Icon: any }[] = [
  { id: "rain", label: "rain", Icon: CloudRain },
  { id: "ocean", label: "ocean", Icon: Waves },
  { id: "fire", label: "fireplace", Icon: Flame },
  { id: "wind", label: "wind", Icon: Wind },
  { id: "forest", label: "forest", Icon: Trees },
  { id: "thunder", label: "thunder", Icon: CloudLightning },
];

export const SoundscapeMixer = () => {
  const [vols, setVols] = useState<Record<SoundType, number>>({
    rain: 0, ocean: 0, fire: 0, wind: 0, forest: 0, thunder: 0,
  });

  useEffect(() => () => stopAllSounds(), []);

  const update = (id: SoundType, v: number) => {
    setVols((p) => ({ ...p, [id]: v }));
    setSoundVolume(id, v / 100);
  };

  return (
    <div className="dream-card rounded-2xl p-6 grain animate-fade-up">
      <div className="flex items-center gap-2 mb-1 text-petal">
        <Waves className="w-4 h-4" />
        <span className="font-sans text-xs uppercase tracking-[0.3em]">soundscapes</span>
      </div>
      <h3 className="font-serif text-2xl text-paper mb-1">Layer the world</h3>
      <p className="font-hand text-muted-foreground text-base mb-5">mix nature like a quiet orchestra</p>

      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {sounds.map(({ id, label, Icon }) => (
          <div key={id} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 transition-colors ${vols[id] > 0 ? "text-sun" : "text-muted-foreground"}`} />
              <span className="text-sm font-serif text-paper capitalize">{label}</span>
            </div>
            <Slider value={[vols[id]]} max={100} onValueChange={([v]) => update(id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
};
