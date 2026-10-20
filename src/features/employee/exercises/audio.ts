import type { SoundId } from "@/lib/practice";

/*
 * Nature and bell sounds made in the browser with the Web Audio API: no recordings, so nothing to license or download.
 * Every sound fades in and out so it never starts or stops with a click.
 */

export type SoundHandle = { stop: (fadeSeconds?: number) => void };

type Ctx = AudioContext;

function noiseBuffer(ctx: Ctx, color: "pink" | "brown", seconds = 6) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    // Paul Kellet's pink filter, and a leaky integrator for brown noise.
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (color === "pink") {
        b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852; b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
  }
  return buffer;
}

function loop(ctx: Ctx, buffer: AudioBuffer, out: AudioNode) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(out);
  src.start();
  return src;
}

function filter(ctx: Ctx, type: BiquadFilterType, frequency: number, q = 0.7) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = frequency;
  f.Q.value = q;
  return f;
}

/** A slow sine that moves an AudioParam between `min` and `max`. */
function lfo(ctx: Ctx, param: AudioParam, rate: number, min: number, max: number) {
  const osc = ctx.createOscillator();
  const depth = ctx.createGain();
  osc.frequency.value = rate;
  depth.gain.value = (max - min) / 2;
  param.value = (max + min) / 2;
  osc.connect(depth).connect(param);
  osc.start();
  return osc;
}

/** One strike of a bell: inharmonic partials that ring out, each decaying at its own speed. */
export function strike(ctx: Ctx, out: AudioNode, base: number, ratios: number[], decay: number, level = 0.3) {
  const now = ctx.currentTime;
  ratios.forEach((ratio, i) => {
    for (const detune of [0, 0.6]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = base * ratio + detune;
      const peak = (level / (i + 1)) * (detune ? 0.5 : 1);
      const ring = decay / (1 + i * 0.6);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(peak, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now + ring);
      osc.connect(g).connect(out);
      osc.start(now);
      osc.stop(now + ring + 0.1);
    }
  });
}

const BOWL = { base: 220, ratios: [1, 2.71, 5.15, 8.4], decay: 14, every: 16 };
const GONG = { base: 82, ratios: [1, 1.47, 2.09, 2.76, 3.56, 4.4], decay: 20, every: 22 };

/** Starts a sound and returns a handle to stop it. */
export function playSound(ctx: Ctx, id: SoundId, volume = 0.8): SoundHandle {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 2.5);
  master.connect(ctx.destination);
  const nodes: AudioScheduledSourceNode[] = [];
  const timers: number[] = [];

  if (id === "hujan") {
    const hp = filter(ctx, "highpass", 500), lp = filter(ctx, "lowpass", 7000);
    nodes.push(loop(ctx, noiseBuffer(ctx, "pink"), hp));
    hp.connect(lp).connect(master);
    // Soft drops on top of the steady rain.
    const drops = ctx.createGain();
    drops.gain.value = 0.08;
    drops.connect(master);
    timers.push(window.setInterval(() => {
      const t = ctx.currentTime, osc = ctx.createOscillator(), g = ctx.createGain();
      osc.frequency.setValueAtTime(1800 + Math.random() * 2400, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
      g.gain.setValueAtTime(0.5 * Math.random(), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      osc.connect(g).connect(drops);
      osc.start(t);
      osc.stop(t + 0.08);
    }, 140));
  } else if (id === "sungai") {
    const bp = filter(ctx, "bandpass", 900, 0.9), lp = filter(ctx, "lowpass", 3500);
    nodes.push(loop(ctx, noiseBuffer(ctx, "brown"), bp));
    nodes.push(lfo(ctx, bp.frequency, 0.23, 500, 1400));
    const gain = ctx.createGain();
    nodes.push(lfo(ctx, gain.gain, 0.37, 0.6, 1));
    bp.connect(lp).connect(gain).connect(master);
  } else if (id === "ombak") {
    const lp = filter(ctx, "lowpass", 900);
    const swell = ctx.createGain();
    nodes.push(loop(ctx, noiseBuffer(ctx, "brown"), lp));
    nodes.push(lfo(ctx, swell.gain, 1 / 11, 0.08, 1));
    nodes.push(lfo(ctx, lp.frequency, 1 / 11, 400, 1300));
    lp.connect(swell).connect(master);
  } else if (id === "burung") {
    const wind = ctx.createGain();
    wind.gain.value = 0.12;
    const lp = filter(ctx, "lowpass", 600);
    nodes.push(loop(ctx, noiseBuffer(ctx, "pink"), lp));
    lp.connect(wind).connect(master);
    const song = () => {
      const t0 = ctx.currentTime;
      const notes = 2 + Math.floor(Math.random() * 4);
      const base = 2300 + Math.random() * 1600;
      const pan = ctx.createStereoPanner();
      pan.pan.value = Math.random() * 1.6 - 0.8;
      pan.connect(master);
      for (let i = 0; i < notes; i++) {
        const t = t0 + i * (0.11 + Math.random() * 0.05);
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.3), t + 0.07);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        osc.connect(g).connect(pan);
        osc.start(t);
        osc.stop(t + 0.1);
      }
    };
    song();
    const next = () => { song(); timers.push(window.setTimeout(next, 1200 + Math.random() * 3500)); };
    timers.push(window.setTimeout(next, 1500));
  } else {
    const bell = id === "mangkuk" ? BOWL : GONG;
    if (id === "gong") {
      // A short, dark noise burst gives the gong its mallet hit.
      const hit = ctx.createGain();
      hit.connect(master);
      const thump = () => {
        const t = ctx.currentTime, src = ctx.createBufferSource(), lp = filter(ctx, "lowpass", 300), g = ctx.createGain();
        src.buffer = noiseBuffer(ctx, "brown", 1);
        g.gain.setValueAtTime(0.5, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        src.connect(lp).connect(g).connect(hit);
        src.start(t);
        src.stop(t + 0.7);
      };
      thump();
      timers.push(window.setInterval(thump, bell.every * 1000));
    }
    strike(ctx, master, bell.base, bell.ratios, bell.decay);
    timers.push(window.setInterval(() => strike(ctx, master, bell.base, bell.ratios, bell.decay), bell.every * 1000));
  }

  return {
    stop(fade = 1.5) {
      timers.forEach((t) => { window.clearInterval(t); window.clearTimeout(t); });
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + fade);
      window.setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch { /* already stopped */ } }); master.disconnect(); }, fade * 1000 + 100);
    },
  };
}

/** One soft bowl strike, for the start and end of a quiet timer. */
export function chime(ctx: Ctx) {
  const out = ctx.createGain();
  out.gain.value = 0.5;
  out.connect(ctx.destination);
  strike(ctx, out, BOWL.base, BOWL.ratios, 8, 0.25);
}

export function audioContext(): AudioContext | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AC ? new AC() : null;
}
