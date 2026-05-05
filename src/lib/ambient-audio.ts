// Procedural ambient soundscapes generated with Web Audio API.
// 100% royalty-free, infinite loops, no downloads required.

export type SoundType = "rain" | "ocean" | "fire" | "wind" | "forest" | "thunder";

interface ActiveSound {
  nodes: AudioNode[];
  gain: GainNode;
  stop: () => void;
}

let ctx: AudioContext | null = null;
const active = new Map<SoundType, ActiveSound>();

const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const makeNoise = (audio: AudioContext, duration = 2) => {
  const buffer = audio.createBuffer(1, audio.sampleRate * duration, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = audio.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  return src;
};

const makeSound = (type: SoundType): ActiveSound => {
  const audio = getCtx();
  const gain = audio.createGain();
  gain.gain.value = 0;
  gain.connect(audio.destination);
  const nodes: AudioNode[] = [gain];

  if (type === "rain") {
    const noise = makeNoise(audio);
    const hp = audio.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 800;
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 6000;
    noise.connect(hp).connect(lp).connect(gain);
    noise.start();
    nodes.push(noise, hp, lp);
  } else if (type === "ocean") {
    const noise = makeNoise(audio, 4);
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 600;
    const wave = audio.createGain();
    wave.gain.value = 0.5;
    const lfo = audio.createOscillator();
    lfo.frequency.value = 0.15;
    const lfoGain = audio.createGain();
    lfoGain.gain.value = 0.4;
    lfo.connect(lfoGain).connect(wave.gain);
    noise.connect(lp).connect(wave).connect(gain);
    noise.start(); lfo.start();
    nodes.push(noise, lp, wave, lfo, lfoGain);
  } else if (type === "fire") {
    const noise = makeNoise(audio);
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 400;
    noise.connect(lp).connect(gain);
    noise.start();
    nodes.push(noise, lp);
    // Crackles
    const crackle = setInterval(() => {
      if (!active.has(type)) return;
      const c = audio.createOscillator();
      const cg = audio.createGain();
      c.frequency.value = 800 + Math.random() * 1600;
      cg.gain.setValueAtTime(0, audio.currentTime);
      cg.gain.linearRampToValueAtTime(0.05 * gain.gain.value * 4, audio.currentTime + 0.005);
      cg.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.05);
      c.connect(cg).connect(gain);
      c.start(); c.stop(audio.currentTime + 0.06);
    }, 80);
    return {
      nodes, gain,
      stop: () => { clearInterval(crackle); nodes.forEach(n => "stop" in n && (n as any).stop?.()); gain.disconnect(); }
    };
  } else if (type === "wind") {
    const noise = makeNoise(audio, 4);
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 500;
    const lfo = audio.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = audio.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain).connect(lp.frequency);
    noise.connect(lp).connect(gain);
    noise.start(); lfo.start();
    nodes.push(noise, lp, lfo, lfoGain);
  } else if (type === "forest") {
    const noise = makeNoise(audio);
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 1200;
    const noiseGain = audio.createGain();
    noiseGain.gain.value = 0.3;
    noise.connect(lp).connect(noiseGain).connect(gain);
    noise.start();
    nodes.push(noise, lp, noiseGain);
    // Bird chirps
    const chirp = setInterval(() => {
      if (!active.has(type)) return;
      if (Math.random() > 0.6) return;
      const o = audio.createOscillator();
      const og = audio.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(2000 + Math.random() * 2000, audio.currentTime);
      o.frequency.exponentialRampToValueAtTime(2500 + Math.random() * 1500, audio.currentTime + 0.1);
      og.gain.setValueAtTime(0, audio.currentTime);
      og.gain.linearRampToValueAtTime(gain.gain.value * 0.3, audio.currentTime + 0.02);
      og.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.15);
      o.connect(og).connect(audio.destination);
      o.start(); o.stop(audio.currentTime + 0.2);
    }, 800);
    return {
      nodes, gain,
      stop: () => { clearInterval(chirp); nodes.forEach(n => "stop" in n && (n as any).stop?.()); gain.disconnect(); }
    };
  } else if (type === "thunder") {
    const noise = makeNoise(audio, 4);
    const lp = audio.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 200;
    noise.connect(lp).connect(gain);
    noise.start();
    nodes.push(noise, lp);
    const rumble = setInterval(() => {
      if (!active.has(type)) return;
      if (Math.random() > 0.3) return;
      const t = audio.currentTime;
      gain.gain.cancelScheduledValues(t);
      const base = gain.gain.value;
      gain.gain.setValueAtTime(base, t);
      gain.gain.linearRampToValueAtTime(base * 4, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(Math.max(base, 0.001), t + 2);
    }, 5000);
    return {
      nodes, gain,
      stop: () => { clearInterval(rumble); nodes.forEach(n => "stop" in n && (n as any).stop?.()); gain.disconnect(); }
    };
  }

  return {
    nodes, gain,
    stop: () => { nodes.forEach(n => "stop" in n && (n as any).stop?.()); gain.disconnect(); }
  };
};

export const setSoundVolume = (type: SoundType, volume: number) => {
  const audio = getCtx();
  if (volume <= 0) {
    const a = active.get(type);
    if (a) {
      a.gain.gain.linearRampToValueAtTime(0, audio.currentTime + 0.5);
      setTimeout(() => { a.stop(); active.delete(type); }, 600);
    }
    return;
  }
  let a = active.get(type);
  if (!a) {
    a = makeSound(type);
    active.set(type, a);
  }
  a.gain.gain.linearRampToValueAtTime(volume * 0.3, audio.currentTime + 0.4);
};

export const stopAllSounds = () => {
  active.forEach((a) => a.stop());
  active.clear();
};
