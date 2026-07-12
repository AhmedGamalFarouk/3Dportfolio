import { useCallback, useRef } from 'react';

interface AudioSynthRef {
  ctx: AudioContext | null;
  ambientOsc: OscillatorNode | null;
  ambientGain: GainNode | null;
  modulator: OscillatorNode | null;
}

export function useAudio() {
  const synth = useRef<AudioSynthRef>({
    ctx: null,
    ambientOsc: null,
    ambientGain: null,
    modulator: null,
  });

  const init = useCallback(() => {
    if (synth.current.ctx) return;
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      synth.current.ctx = new AudioContextClass();
    }
  }, []);

  const resume = useCallback(() => {
    const ctx = synth.current.ctx;
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }, []);

  const playClick = useCallback(() => {
    init();
    const ctx = synth.current.ctx;
    if (!ctx) return;
    resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, [init, resume]);

  const playPowerSurge = useCallback(() => {
    init();
    const ctx = synth.current.ctx;
    if (!ctx) return;
    resume();
    const now = ctx.currentTime;

    // Sub-bass rumble
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(25, now);
    subOsc.frequency.exponentialRampToValueAtTime(80, now + 1.2);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    // High sweep
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(100, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(1800, now + 1.0);
    sweepGain.gain.setValueAtTime(0.08, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 1.0);
    sweepOsc.connect(filter);
    filter.connect(sweepGain);
    sweepGain.connect(ctx.destination);

    // White noise sparks
    const bufferSize = ctx.sampleRate * 0.6;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(6000, now + 0.5);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    subOsc.start(); subOsc.stop(now + 1.5);
    sweepOsc.start(); sweepOsc.stop(now + 1.2);
    whiteNoise.start(); whiteNoise.stop(now + 0.6);
  }, [init, resume]);

  const startAmbient = useCallback(() => {
    init();
    const ctx = synth.current.ctx;
    if (!ctx || synth.current.ambientOsc) return;
    resume();

    const ambientOsc = ctx.createOscillator();
    const ambientGain = ctx.createGain();
    const modulator = ctx.createOscillator();
    const modGain = ctx.createGain();

    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 55;
    modulator.frequency.value = 3.5;
    modGain.gain.value = 1.5;
    modulator.connect(modGain);
    modGain.connect(ambientOsc.frequency);
    ambientGain.gain.setValueAtTime(0.06, ctx.currentTime);
    ambientOsc.connect(ambientGain);
    ambientGain.connect(ctx.destination);
    modulator.start();
    ambientOsc.start();

    synth.current.ambientOsc = ambientOsc;
    synth.current.ambientGain = ambientGain;
    synth.current.modulator = modulator;
  }, [init, resume]);

  const playChime = useCallback(() => {
    init();
    const ctx = synth.current.ctx;
    if (!ctx) return;
    resume();
    const now = ctx.currentTime;
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const delay = idx * 0.08;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.025, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.6);
    });
  }, [init, resume]);

  return { playClick, playPowerSurge, startAmbient, playChime };
}
